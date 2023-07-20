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
export function carbonCopyMap<T extends Map<any, any>>(map: T): T {
  let newMap = new Map() as T
  for (let [key, value] of map) {
    const _key = isArray(key) ? [...key] : key
    const _value = isArray(value) ? [...value] : value
    newMap.set(_key, _value)
  }
  return newMap
}

export function filterStateToClauses(state: FilterState): WhereClauseTuple<any, any, any>[] {
  const whereClauses = [...carbonCopyMap(state).entries()]
    .filter(([clause, state]) => !!state)
    .map(([clause]) => clause)

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

/**
 * Splits a string on links and returns an array of objects
 */
export function splitOnLink(text: string): { kind: 'text' | 'link'; content: string }[] {
  /** this regex checks for links */
  const regex = new RegExp(
    /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gi
  )

  const matches = text.matchAll(regex)

  const links: { text: string; start: number; end: number }[] = []

  for (const match of matches) {
    links.push({
      text: match[0],
      start: match.index || 0,
      end: (match.index || 0) + match[0].length,
    })
  }

  const returnArray: { kind: 'text' | 'link'; content: string }[] = []

  if (links.length > 0) {
    let lastIndex = 0

    links.forEach((link, index) => {
      if (link.start === 0) {
        returnArray.push({
          kind: 'link',
          content: link.text,
        })
        lastIndex = link.end
      }
      if (link.start !== 0) {
        // is there gap between link start and lastindex?
        if (link.start > lastIndex) {
          returnArray.push({
            kind: 'text',
            content: text.substring(lastIndex, link.start),
          })
        }
        returnArray.push({
          kind: 'link',
          content: link.text,
        })
        lastIndex = link.end
      }
      if (index === links.length - 1 && lastIndex < text.length) {
        returnArray.push({
          kind: 'text',
          content: text.substring(link.end, text.length),
        })
      }
    })
  }

  if (returnArray.length) return returnArray.filter((p) => p.content)

  return [{ kind: 'text' as const, content: text }].filter((p) => p.content)
}
