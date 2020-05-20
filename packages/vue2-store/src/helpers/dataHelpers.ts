import { PlainObject, Clauses } from '@vue-sync/core'
import { isNumber, isArray } from 'is-what'
import pathToProp from 'path-to-prop'
import sort from 'fast-sort'
import { ISortByObjectSorter } from 'fast-sort'

/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Map<string, PlainObject>} collectionDB
 * @param {Clauses} clauses
 * @returns {Map<string, PlainObject>}
 */
export function filterDataPerClauses (
  collectionDB: Map<string, PlainObject>,
  clauses: Clauses
): Map<string, PlainObject> {
  const { where = [], orderBy = [], limit } = clauses
  // return the same collectionDB to be sure to keep reactivity
  if (!where.length && !orderBy.length && !isNumber(limit)) return collectionDB
  // all other cases we need to create a new Map() with the results
  const entries: [string, PlainObject][] = []
  collectionDB.forEach((docData, docId) => {
    const passesWhereFilters = where.every(whereQuery => {
      const [fieldPath, operator, expectedValue] = whereQuery
      const valueAtFieldPath = pathToProp(docData, fieldPath)
      let passes = false
      switch (operator) {
        case '==':
          passes = valueAtFieldPath == expectedValue
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
    const sorter: ISortByObjectSorter<[string, PlainObject]> = {
      [direction as 'asc']: (entry: [string, PlainObject]) => pathToProp(entry[1], path),
    }
    carry.push(sorter)
    return carry
  }, [] as ISortByObjectSorter<[string, PlainObject]>[])
  const entriesOrdered = orderBy.length ? sort(entries).by(by) : entries
  // limit
  const entriesLimited = isNumber(limit) ? entriesOrdered.slice(0, limit) : entriesOrdered
  // turn back into MAP
  const filteredDataMap: Map<string, PlainObject> = new Map(entriesLimited)
  return filteredDataMap
}
