import { CollectionInstance, WhereClauseTuple } from '@magnetarjs/types'
import { sort } from 'fast-sort'
import { isPlainObject } from 'is-what'
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

export function filterStateToClauses(state: FilterState): WhereClauseTuple<any, any, any>[] {
  return [...state.entries()].filter(([clause, state]) => !!state).map(([clause]) => clause)
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
