import type { Clauses, QueryClause, WhereClause } from '@magnetarjs/types'
import { ISortByObjectSorter, sort } from 'fast-sort'
import { isArray, isNumber } from 'is-what'
import { getProp } from 'path-to-prop'
import { parseValueForFilters } from './parseValueForFilters.js'

function passesWhere(docData: { [key: string]: unknown }, whereQuery: WhereClause): boolean {
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
}

function passesQuery(docData: { [key: string]: unknown }, queryClause: QueryClause): boolean {
  if ('and' in queryClause) {
    return queryClause.and.every((clause) =>
      isArray(clause) ? passesWhere(docData, clause) : passesQuery(docData, clause)
    )
  }
  // if ('or' in queryClause)
  return queryClause.or.some((clause) =>
    isArray(clause) ? passesWhere(docData, clause) : passesQuery(docData, clause)
  )
}

/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 */
export function filterDataPerClauses(
  dataCollectionMap: Map<string, { [key: string]: unknown }>,
  clauses: Clauses
): Map<string, { [key: string]: unknown }> {
  const queryClauses = clauses.query || []
  const whereClauses = clauses.where || []
  const orderByClauses = clauses.orderBy || []
  const { limit, startAfter } = clauses
  // return the same dataCollectionMap to be sure to keep reactivity
  if (
    !queryClauses.length &&
    !whereClauses.length &&
    !orderByClauses.length &&
    !isNumber(limit) &&
    !startAfter
  ) {
    return dataCollectionMap
  }
  // all other cases we need to create a new Map() with the results
  let entries: [string, { [key: string]: unknown }][] = []
  dataCollectionMap.forEach((docData, docId) => {
    const passedQuery = queryClauses.every((queryClause) => passesQuery(docData, queryClause))
    if (!passedQuery) return
    const passedWhereFilters = whereClauses.every((whereClause) =>
      passesWhere(docData, whereClause)
    )
    if (!passedWhereFilters) return
    entries.push([docId, docData])
  })
  // orderBy
  const by = orderByClauses.reduce(
    (carry, [path, direction = 'asc']) => {
      const sorter: ISortByObjectSorter<[string, { [key: string]: unknown }]> = {
        [direction as 'asc']: (entry: [string, { [key: string]: unknown }]) =>
          getProp(entry[1], path),
      }
      carry.push(sorter)
      return carry
    },
    [] as ISortByObjectSorter<[string, { [key: string]: unknown }]>[]
  )
  entries = orderByClauses.length ? sort(entries).by(by) : entries
  // startAfter
  if (startAfter && orderByClauses.length) {
    const orderByKeys = orderByClauses.map(([path]) => path)
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
