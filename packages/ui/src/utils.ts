import { CollectionInstance, WhereClause, WhereFilterOp } from '@magnetarjs/types'
import { sort } from 'fast-sort'
import { mapGetOrSet } from 'getorset-anything'
import { isArray, isPlainObject, isString } from 'is-what'
import {
  EntryOfOrderByState,
  FiltersState,
  MUIColumn,
  MUIFilter,
  OPaths,
  OrderByState,
} from './types'

export function mapUnshift<K, V>(map: Map<K, V>, ...newEntries: [K, V][]): Map<K, V> {
  const oldEntries = [...map.entries()].filter(([key]) => !newEntries.find((e) => e[0] === key))
  return new Map([...newEntries, ...oldEntries])
}

export function isEqual(a: any | any[], b: any | any[]): boolean {
  if (isArray(a) && isArray(b)) {
    return a.length === b.length && a.every((item, index) => item === b[index])
  }
  return a === b
}

export function whereClausesEqual(where1?: WhereClause, where2?: WhereClause): boolean {
  return (
    !!where1 &&
    !!where2 &&
    isEqual(where1[0], where2[0]) &&
    isEqual(where1[1], where2[1]) &&
    isEqual(where1[2], where2[2])
  )
}

export function filtersAndColumnsToInitialState(params: {
  columns: MUIColumn<any>[]
  filters: MUIFilter<Record<string, any>>[]
}): {
  filtersState: FiltersState
  orderByState: OrderByState
} {
  const { columns, filters } = params
  // remember, see `FiltersState` for instructions how to save the state.
  const _filtersState = filters.reduce<FiltersState>((map, f, i) => {
    if (f.type === 'radio' || f.type === 'select') {
      const firstChecked = f.options?.find((o) => o.checked)
      if (firstChecked) map.set(i, firstChecked.where)
    }
    if (f.type === 'checkboxes') {
      for (const option of f.options || []) {
        if (option.checked) {
          const state = mapGetOrSet(map, i, () => ({ or: new Set() }))
          state.or.add(option.where)
        }
      }
    }
    if (f.type === 'text' || f.type === 'number' || f.type === 'date') {
      if (f.initialValue !== undefined) {
        map.set(i, f.initialValue)
      }
    }
    return map
  }, new Map())

  // maybe we needed to clear other filters, let's do that for the first filter we find that needs it
  const entryThatClearsOtherFilters = [..._filtersState.entries()].find(([filterIndex]) => {
    const filter = filters[filterIndex]
    return filter?.clearOtherFilters
  })
  const filtersState = entryThatClearsOtherFilters
    ? new Map([entryThatClearsOtherFilters])
    : _filtersState

  // maybe we needed to clear other orderBy, let's do that for the first filter we find that needs it
  const entryThatClearsOtherOrderBy = [...filtersState.entries()].find(([filterIndex]) => {
    const filter = filters[filterIndex]
    return filter?.clearOrderBy
  })

  const _orderByState = entryThatClearsOtherOrderBy
    ? new Map()
    : sort(columns)
        // sort columns by sortable.position
        .asc((c) => (isPlainObject(c.sortable) ? c.sortable.position : -1))
        // then grab each column's sortable.orderBy and save as "direction" in a map
        .reduce<OrderByState>((map, column) => {
          if (isPlainObject(column.sortable) && column.sortable.orderBy && column.fieldPath) {
            map.set(column.fieldPath, column.sortable.orderBy)
          }
          return map
        }, new Map())

  const newEntries = getRequiredOrderByBasedOnFilters(filtersState)
  const orderByState = newEntries.length ? mapUnshift(_orderByState, ...newEntries) : _orderByState

  return { filtersState, orderByState }
}

/**
 * Some might need an extra orderBy query because of Firestore limitations.
 * @see https://firebase.google.com/docs/firestore/query-data/order-limit-data#limitations
 */
export function getRequiredOrderByBasedOnFilters(
  filtersState?: null | FiltersState
): EntryOfOrderByState[] {
  if (!filtersState) return []

  return [...filtersState.values()].reduce<EntryOfOrderByState[]>((orderByEntries, filterState) => {
    if (!filterState) return orderByEntries

    const whereClauses = isString(filterState)
      ? []
      : isArray(filterState)
      ? [filterState]
      : [...filterState.or]
    // : 'and' in filterState
    // ? [...filterState.and]
    // : [...filterState.or]
    const firstWhereClause = whereClauses[0]

    const op: WhereFilterOp = firstWhereClause?.[1]
    /**
     * Optionally an `orderBy` might need to be set for a certain where filter
     *
     * An example error from firestore:
     * > Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field 'title' and so you must also use 'title' as your first argument to orderBy(), but your first orderBy() is on field 'isDone' instead.
     */
    const alsoApplyOrderBy =
      op === '!=' || op === '<' || op === '<=' || op === '>' || op === '>=' || op === 'not-in'
    if (firstWhereClause && alsoApplyOrderBy) {
      const fieldPath = firstWhereClause[0]
      const direction = 'asc'
      // must be inserted at position 0
      orderByEntries.push([fieldPath, direction])
    }
    return orderByEntries
  }, [])
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

/** Clears JavaScript reference pointers */
export function carbonCopyState<T extends Set<any>>(set: T): T {
  let newSet = new Set() as T
  for (let value of set) {
    const _value = isArray(value) ? [...value] : value
    newSet.add(_value)
  }
  return newSet
}

function combineWhereClausesWherePossible(whereClauses: WhereClause[]): WhereClause[] {
  return whereClauses.reduce<WhereClause[]>((result, whereClause) => {
    const [fieldPath, op, value] = whereClause

    const addToPreviousWhere = result.find(
      (w) => w[0] === fieldPath && (w[1] === op || w[1] === 'in' || w[1] === 'not-in')
    )

    if (!addToPreviousWhere) {
      result.push([...whereClause])
      return result
    }

    const opFound = addToPreviousWhere[1]
    if (opFound === 'in' || opFound === 'not-in') {
      addToPreviousWhere[2] = [...new Set([...addToPreviousWhere[2], value])]
    }
    if (opFound === '==') {
      addToPreviousWhere[1] = 'in'
      addToPreviousWhere[2] = [...new Set([addToPreviousWhere[2], value])]
    }
    if (opFound === '!=') {
      addToPreviousWhere[1] = 'not-in'
      addToPreviousWhere[2] = [...new Set([addToPreviousWhere[2], value])]
    }
    return result
  }, [])
}

export function filterStateToClauses(
  state: FiltersState,
  filters: MUIFilter<any, any>[]
): { filterIndex: number; result: WhereClause | { or: WhereClause[] } }[] {
  return [...state.entries()].reduce<
    { filterIndex: number; result: WhereClause | { or: WhereClause[] } }[]
  >((results, entry) => {
    const [filterIndex, state] = entry

    if (!state) return results

    if (isArray(state)) {
      results.push({ filterIndex, result: state })
      return results
    }

    // TODO: not yet implemented
    // if ('and' in state) {
    //   const set = state.and
    //   if (set.size === 0) return results
    //   if (set.size === 1) {
    //     const result = ([...set][0])
    //     results.push({ filterIndex, result })
    //     return results
    //   }
    //   const combinedWheres = combineWhereClausesWherePossible([...set])
    //   if (combinedWheres.length === 1) {
    //     const result = (combinedWheres[0])
    //     results.push({ filterIndex, result })
    //     return results
    //   }
    //   const result = ({ and: combinedWheres })
    //   results.push({ filterIndex, result })
    //   return results
    // }

    if (isString(state) || 'or' in state) {
      const set = isString(state)
        ? (() => {
            // we need to convert the string to a where clause as per the filter spec
            const filter = filters[filterIndex]
            if (
              !filter ||
              (filter.type !== 'text' && filter.type !== 'number' && filter.type !== 'date')
            ) {
              return new Set<WhereClause>()
            }

            const whereClauseSpecs = isArray(filter.where)
              ? [filter.where]
              : filter.query && isArray(filter.query.or)
              ? filter.query.or
              : []
            const whereClauses: WhereClause[] =
              whereClauseSpecs?.map<WhereClause>((spec) => {
                const [fieldPath, op, parseInput] = spec
                return [fieldPath, op, parseInput(state)]
              }) || []
            return new Set<WhereClause>(whereClauses)
          })()
        : state.or

      if (set.size === 0) return results
      if (set.size === 1) {
        const result = [...set][0]
        results.push({ filterIndex, result })
        return results
      }
      /**
       * Perhaps we can combine all of these into 1?
       */
      const combinedWheres = combineWhereClausesWherePossible([...set])
      if (combinedWheres.length === 1) {
        const result = combinedWheres[0]
        results.push({ filterIndex, result })
        return results
      }
      const result = { or: combinedWheres }
      results.push({ filterIndex, result })
      return results
    }

    return results
  }, [])
}

export function orderByStateToClauses(
  state: OrderByState
): [fieldPath: OPaths<any>, direction: 'asc' | 'desc'][] {
  return [...state.entries()].map(([path, direction]) => [path, direction])
}

export function calcCollection(
  collection: CollectionInstance<any>,
  filtersState: FiltersState,
  orderByState: OrderByState,
  filters: MUIFilter<any, any>[]
): CollectionInstance<any> {
  const clauses = filterStateToClauses(filtersState, filters).map(({ result }) => result)
  for (const whereOrQuery of clauses) {
    if (isArray(whereOrQuery)) {
      collection = collection.where(...whereOrQuery)
    } else {
      collection = collection.query(whereOrQuery)
    }
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
