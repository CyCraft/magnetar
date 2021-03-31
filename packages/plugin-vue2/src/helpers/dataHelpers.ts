import { Clauses } from '@magnetarjs/core'
import { isNumber, isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import sort, { ISortByObjectSorter } from 'fast-sort'

/**
 * Filters a Collection module's data based on provided clauses.
 *
 * @param {Record<string, Record<string, any>>} collectionDB
 * @param {Clauses} clauses
 * @returns {'no-filter' | [string, Record<string, any>][]} filtered and sorted entries
 */
export function filterDataPerClauses(
  collectionDB: Record<string, Record<string, any>>,
  clauses: Clauses
): 'no-filter' | [string, Record<string, any>][] {
  const { where = [], orderBy = [], limit } = clauses
  // return 'no-filter' if no filtering is needed
  if (!where.length && !orderBy.length && !isNumber(limit)) return 'no-filter'
  // all other cases we need to create a new Map() with the results
  const entries: [string, Record<string, any>][] = []
  Object.entries(collectionDB).forEach(([docId, docData]) => {
    const passesWhereFilters = where.every((whereQuery) => {
      const [fieldPath, operator, expectedValue] = whereQuery
      const valueAtFieldPath = getProp(docData, fieldPath) as any
      let passes = false
      switch (operator) {
        case '==':
          passes = valueAtFieldPath == expectedValue
          break
        case '!=':
          passes = valueAtFieldPath != expectedValue
          break
        case '<':
          passes = valueAtFieldPath < expectedValue
          break
        case '<=':
          passes = valueAtFieldPath <= expectedValue
          break
        case '>':
          passes = valueAtFieldPath > expectedValue
          break
        case '>=':
          passes = valueAtFieldPath >= expectedValue
          break
        case 'in':
          passes = isArray(expectedValue) && expectedValue.includes(valueAtFieldPath)
          break
        case 'not-in':
          passes = isArray(expectedValue) && !expectedValue.includes(valueAtFieldPath)
          break
        case 'array-contains':
          passes = isArray(valueAtFieldPath) && valueAtFieldPath.includes(expectedValue)
          break
        case 'array-contains-any':
          passes =
            isArray(valueAtFieldPath) &&
            valueAtFieldPath.some((v: any) => isArray(expectedValue) && expectedValue.includes(v))
          break
        default:
          throw new Error('invalid operator')
      }
      return passes
    })
    if (!passesWhereFilters) return
    entries.push([docId, docData])
  })
  // orderBy
  const by = orderBy.reduce((carry, [path, direction = 'asc']) => {
    const sorter: ISortByObjectSorter<[string, Record<string, any>]> = {
      [direction as 'asc']: (entry: [string, Record<string, any>]) => getProp(entry[1], path),
    }
    carry.push(sorter)
    return carry
  }, [] as ISortByObjectSorter<[string, Record<string, any>]>[])
  const entriesOrdered = orderBy.length ? sort(entries).by(by) : entries
  // limit
  const entriesOrderedAndLimited = isNumber(limit) ? entriesOrdered.slice(0, limit) : entriesOrdered

  return entriesOrderedAndLimited
}

type CustomMap<DocDataType = Record<string, any>> = {
  // data
  /**
   * Returns the number of key/value pairs in the Map object.
   */
  size: number

  /**
   * Removes all key-value pairs from the Map object.
   */
  clear: () => void
  /**
   * Removes the value associated to the key from the Map object.
   * @returns {boolean} `true` if an element in the Map object existed and has been removed, or `false` if the element does not exist.
   */
  delete: (key: string) => boolean

  /**
   * Returns the value associated to the key, or undefined if there is none.
   */
  get: (key: string) => DocDataType
  /**
   * Returns a boolean asserting whether a value has been associated to the key in the Map object or not.
   */
  has: (key: string) => boolean

  /**
   * Returns a new Iterator object that contains the keys for each element in the Map object in insertion order.
   */
  keys: () => IterableIterator<string>
  /**
   * Returns a new Iterator object that contains the values for each element in the Map object in insertion order.
   */
  values: () => IterableIterator<DocDataType>
  /**
   * Returns a new Iterator object that contains an array of [key, value] for each element in the Map object in insertion order.
   */
  entries: () => IterableIterator<[string, DocDataType]>
  /**
   * Calls callbackFn once for each key-value pair present in the Map object, in insertion order. If a thisArg parameter is provided to forEach, it will be used as the this value for each callback.
   */
  forEach: (
    callbackfn: (
      value: DocDataType,
      key: string,
      map: Map<string, DocDataType>,
      thisArg?: any
    ) => void
  ) => void
}

export function objectToMap(
  object: Record<string, any> | undefined,
  originalObjectToClear: Record<string, any> | undefined,
  entriesInCustomOrder?: [string, Record<string, any>][]
): Map<string, Record<string, any>> {
  const dic = object || {}

  function get(id: string) {
    return dic[id]
  }
  function has(id: string) {
    return !!dic[id]
  }
  function keys() {
    if (entriesInCustomOrder) return entriesInCustomOrder.map((e) => e[0])
    return Object.keys(dic)
    // return IterableIterator<string>
  }
  function values() {
    if (entriesInCustomOrder) return entriesInCustomOrder.map((e) => e[1])
    return Object.values(dic)
    // return IterableIterator<Record<string, any>>
  }
  function entries() {
    if (entriesInCustomOrder) return entriesInCustomOrder
    return Object.entries(dic)
    // return IterableIterator<[string, Record<string, any>]>
  }
  function clear() {
    if (!originalObjectToClear) return
    if (entriesInCustomOrder) {
      entriesInCustomOrder.forEach(([key]) => {
        delete originalObjectToClear[key]
      })
    } else {
      Object.keys(originalObjectToClear).forEach((key) => {
        delete originalObjectToClear[key]
      })
    }
  }
  function _delete(id: string) {
    const existed = id in dic
    if (existed) delete dic[id]
    return existed
  }
  function forEach(
    callbackfn: (value: any, key: string, map: Map<string, any>, thisArg?: any) => void
  ) {
    const _entries = entriesInCustomOrder || Object.entries(dic)

    _entries.forEach(([k, v]) => {
      callbackfn(v, k, new Map())
    })
  }

  const raw = dic

  const customMap: CustomMap = {
    size: Object.keys(dic).length,
    get,
    has,
    keys,
    values,
    entries,
    forEach,
    clear,
    delete: _delete,
    raw,
  } as any
  return customMap as any
}
