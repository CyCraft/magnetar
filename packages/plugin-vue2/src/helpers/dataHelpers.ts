import { Clauses } from '@magnetarjs/core'
import { isNumber, isArray, isUndefined } from 'is-what'
import { getProp } from 'path-to-prop'
import sort from 'fast-sort'
import { ISortByObjectSorter } from 'fast-sort'

/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Record<string, Record<string, any>>} collectionDB
 * @param {Clauses} clauses
 * @returns {Record<string, Record<string, any>>}
 */
export function filterDataPerClauses(
  collectionDB: Record<string, Record<string, any>>,
  clauses: Clauses
): Record<string, Record<string, any>> {
  const { where = [], orderBy = [], limit } = clauses
  // return the same collectionDB to be sure to keep reactivity
  if (!where.length && !orderBy.length && !isNumber(limit)) return collectionDB
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
  const entriesLimited = isNumber(limit) ? entriesOrdered.slice(0, limit) : entriesOrdered
  // turn back into MAP
  const filteredDataDic: Record<string, Record<string, any>> = Object.fromEntries(entriesLimited)
  return filteredDataDic
}

type CustomMap<DocDataType = Record<string, any>> = {
  // data
  /**
   * Returns the number of key/value pairs in the Map object.
   */
  size: number

  // Do not implement:
  // /**
  //  * Removes all key-value pairs from the Map object.
  //  */
  // clear: () => void

  /**
   * Returns the value associated to the key, or undefined if there is none.
   */
  get: (id: string) => DocDataType
  /**
   * Returns a boolean asserting whether a value has been associated to the key in the Map object or not.
   */
  has: (id: string) => boolean

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
  object: Record<string, any> | undefined
): Map<string, Record<string, any>> {
  if (isUndefined(object)) return new Map()
  const dic = object

  function get(id: string) {
    return dic[id]
  }
  function has(id: string) {
    return !!dic[id]
  }
  function keys() {
    return Object.keys(dic)
    // return IterableIterator<string>
  }
  function values() {
    return Object.values(dic)
    // return IterableIterator<Record<string, any>>
  }
  function entries() {
    return Object.entries(dic)
    // return IterableIterator<[string, Record<string, any>]>
  }
  function forEach(
    callbackfn: (value: any, key: string, map: Map<string, any>, thisArg?: any) => void
  ) {
    Object.entries(dic).forEach(([k, v]) => {
      callbackfn(v, k, new Map())
    })
  }

  const raw = dic

  const customMap: CustomMap = {
    size: 0,
    get,
    has,
    keys,
    values,
    entries,
    forEach,
    raw,
  } as any
  return customMap as any
}
