import { Clauses } from '../../../../core/src'
import { isNumber, isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import sort from 'fast-sort'
import { ISortByObjectSorter } from 'fast-sort'

/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Map<string, Record<string, any>>} collectionDB
 * @param {Clauses} clauses
 * @returns {Map<string, Record<string, any>>}
 */
export function filterDataPerClauses(
  collectionDB: Map<string, Record<string, any>>,
  clauses: Clauses
): Map<string, Record<string, any>> {
  const { where = [], orderBy = [], limit } = clauses
  // return the same collectionDB to be sure to keep reactivity
  if (!where.length && !orderBy.length && !isNumber(limit)) return collectionDB
  // all other cases we need to create a new Map() with the results
  const entries: [string, Record<string, any>][] = []
  collectionDB.forEach((docData, docId) => {
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
  const filteredDataMap: Map<string, Record<string, any>> = new Map(entriesLimited)
  return filteredDataMap
}
