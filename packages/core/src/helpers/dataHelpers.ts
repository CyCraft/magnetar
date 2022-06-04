import { isNumber, isArray } from 'is-what'
import { getProp } from 'path-to-prop'
import { sort, ISortByObjectSorter } from 'fast-sort'
import { Clauses } from '../types/clauses'
import { parseValueForFilters } from './parseValueForFilters'

/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 */
export function filterDataPerClauses(
  collectionDB: Map<string, Record<string, any>>,
  clauses: Clauses
): Map<string, Record<string, any>> {
  const { where = [], orderBy = [], limit, startAfter } = clauses
  // return the same collectionDB to be sure to keep reactivity
  if (!where.length && !orderBy.length && !isNumber(limit) && !startAfter) return collectionDB
  // all other cases we need to create a new Map() with the results
  let entries: [string, Record<string, any>][] = []
  collectionDB.forEach((docData, docId) => {
    const passesWhereFilters = where.every((whereQuery) => {
      const [fieldPath, operator, expectedValue] = whereQuery
      const valueAtFieldPath = parseValueForFilters(getProp(docData, fieldPath) as any)
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
  entries = orderBy.length ? sort(entries).by(by) : entries
  // startAfter
  if (startAfter && orderBy) {
    const orderByKeys = orderBy.map(([path]) => path)
    const startAfterValues = Array.isArray(startAfter)
      ? startAfter
      : orderByKeys.map((key) => startAfter[key])
    if (startAfterValues.length > orderByKeys.length) {
      throw new Error('startAfter must have the same or smaller number of values than orderBy')
    }
    for (const [index, key] of orderByKeys.entries()) {
      const value = startAfterValues[index]
      if (value == null) continue
      const startIndex = entries.findIndex(([docId, docData]) => getProp(docData, key) === value)
      if (startIndex === -1) continue
      entries = entries.slice(startIndex + 1)
    }
  }
  // limit
  entries = isNumber(limit) ? entries.slice(0, limit) : entries
  // turn back into MAP
  return new Map(entries)
}
