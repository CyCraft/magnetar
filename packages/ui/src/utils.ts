import { CollectionInstance, WhereClauseTuple } from '@magnetarjs/types'
import { sort } from 'fast-sort'
import { isArray, isPlainObject } from 'is-what'
import { FilterState, MUIColumn, MUIFilter, OPaths, OrderByState } from './types'

export function filtersToInitialState(filters: MUIFilter<any, any, any>[]): FilterState {
  return filters.reduce<FilterState>((map, f) => {
    if (f.type === 'radio' || f.type === 'select') {
      const firstChecked = f.options.find((o) => o.checked)
      if (firstChecked) map.set(firstChecked.where, true)
    }
    if (f.type === 'checkboxes') {
      for (const option of f.options) {
        if (option.checked) map.set(option.where, true)
      }
    }
    return map
  }, new Map())
}

export function columnsToInitialOrderByState(columns: MUIColumn<any>[]): OrderByState {
  return (
    sort(columns)
      // sort columns by sortable.position
      .asc((c) => (isPlainObject(c.sortable) ? c.sortable.position : -1))
      // then grab each column's sortable.orderBy and save as "direction" in a map
      .reduce<OrderByState>((map, column) => {
        if (isPlainObject(column.sortable) && column.fieldPath) {
          map.set(column.fieldPath, column.sortable.orderBy)
        }
        return map
      }, new Map())
  )
}

/** Clears JavaScript reference pointers */
function carbonCopyWhere(where: WhereClauseTuple<any, any, any>): WhereClauseTuple<any, any, any> {
  return where.map((w) => (isArray(w) ? [...w] : w)) as any
}

export function filterStateToClauses(state: FilterState): WhereClauseTuple<any, any, any>[] {
  const whereClauses = [...state.entries()]
    .filter(([clause, state]) => !!state)
    .map(([clause]) => carbonCopyWhere(clause))

  return whereClauses.reduce<WhereClauseTuple<any, any, any>[]>((result, whereArr) => {
    const [fieldPath, op, value] = whereArr

    const addToPreviousWhere = result.find(
      (w) => w[0] === fieldPath && (w[1] === op || w[1] === 'in' || w[1] === 'not-in')
    )

    if (!addToPreviousWhere) {
      result.push(whereArr)
      return result
    }

    const currentOp = addToPreviousWhere[1]
    if (currentOp === 'in' || currentOp === 'not-in') {
      addToPreviousWhere[2] = [...new Set([...addToPreviousWhere[2], value])]
    }
    if (currentOp === '==') {
      addToPreviousWhere[1] = 'in'
      addToPreviousWhere[2] = [...new Set([addToPreviousWhere[2], value])]
    }
    if (currentOp === '!=') {
      addToPreviousWhere[1] = 'not-in'
      addToPreviousWhere[2] = [...new Set([addToPreviousWhere[2], value])]
    }
    return result
  }, [])
}

export function orderByStateToClauses(
  state: OrderByState
): [fieldPath: OPaths<any>, direction: 'asc' | 'desc'][] {
  return [...state.entries()].map(([path, direction]) => [path, direction])
}

export function calcCollection(
  collection: CollectionInstance<any>,
  filterState: FilterState,
  orderByState: OrderByState
): CollectionInstance<any> {
  for (const where of filterStateToClauses(filterState)) {
    collection = collection.where(...where)
  }
  for (const orderBy of orderByStateToClauses(orderByState)) {
    collection = collection.orderBy(...orderBy)
  }
  return collection
}
