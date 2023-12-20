import type { CollectionInstance, QueryClause, WhereClause, WhereFilterOp } from '@magnetarjs/types'
import { sort } from 'fast-sort'
import { isArray, isPlainObject, isString } from 'is-what'
import type {
  EntryOfOrderByState,
  FilterStateCheckboxes,
  FiltersState,
  MUIColumn,
  MUIFilter,
  MUIFilterOption,
  OPaths,
  OrderByState,
} from '../types'

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

export function clausesEqual(
  clause1?: WhereClause | QueryClause,
  clause2?: WhereClause | QueryClause
): boolean {
  return !!clause1 && !!clause2 && JSON.stringify(clause1) === JSON.stringify(clause2)
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
  const newFiltersState = filters.reduce<FiltersState>((_filtersState, f, i) => {
    const options: undefined | MUIFilterOption<Record<string, any>, string>[] = f.options
    if ((f.type === 'radio' || f.type === 'select') && options) {
      const firstChecked = options.find((o) => !!o.checked)
      if (firstChecked) {
        if (firstChecked.where) {
          _filtersState.set(i, firstChecked.where)
        }
        if (firstChecked.query) {
          _filtersState.set(i, firstChecked.query)
        }
      }
    }
    if (f.type === 'checkboxes' && options) {
      const state: FilterStateCheckboxes = { or: [] }
      for (const option of options || []) {
        if (option.checked) {
          if (option.where) state.or.push(option.where)
          if (option.query) state.or.push(option.query)
        }
      }
      if (state.or.length) _filtersState.set(i, state)
    }
    if (f.type === 'text' || f.type === 'number' || f.type === 'date') {
      if (f.initialValue !== undefined) {
        _filtersState.set(i, f.initialValue)
      }
    }
    return _filtersState
  }, new Map())

  // maybe we needed to clear other filters, let's do that for the first filter we find that needs it
  const entryThatClearsOtherFilters = [...newFiltersState.entries()].find(([filterIndex]) => {
    const filter = filters[filterIndex]
    return filter?.clearOtherFilters
  })
  const filtersState = entryThatClearsOtherFilters
    ? new Map([entryThatClearsOtherFilters])
    : newFiltersState

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

    const firstClause: WhereClause | QueryClause | undefined = isString(filterState)
      ? undefined
      : isArray(filterState)
      ? filterState
      : 'or' in filterState && isArray(filterState.or[0])
      ? filterState.or[0]
      : 'and' in filterState && isArray(filterState.and[0])
      ? filterState.and[0]
      : undefined

    const op: WhereFilterOp | undefined = firstClause?.[1]
    /**
     * Optionally an `orderBy` might need to be set for a certain where filter
     *
     * An example error from firestore:
     * > Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field 'title' and so you must also use 'title' as your first argument to orderBy(), but your first orderBy() is on field 'isDone' instead.
     */
    const alsoApplyOrderBy =
      op === '!=' || op === '<' || op === '<=' || op === '>' || op === '>=' || op === 'not-in'
    if (firstClause && alsoApplyOrderBy) {
      const fieldPath = firstClause[0]
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
): {
  /** `filterIndex` is needed to be able to clear the filters again */
  filterIndex: number
  result: WhereClause[] | QueryClause
}[] {
  return [...state.entries()].reduce<
    { filterIndex: number; result: WhereClause[] | QueryClause }[]
  >((results, entry) => {
    const [filterIndex, state] = entry

    if (!state) return results

    if (isString(state)) {
      // we need to convert the string to a where clause as per the filter spec
      const filter = filters[filterIndex]
      if (
        !filter ||
        (filter.type !== 'text' && filter.type !== 'number' && filter.type !== 'date')
      ) {
        return results
      }

      if (filter.where) {
        const [fieldPath, op, parseInput] = filter.where
        results.push({ filterIndex, result: [[fieldPath, op, parseInput(state)]] })
        return results
      }

      if (filter.query) {
        const ors = filter.query.or.map<WhereClause>((where) => {
          const [fieldPath, op, parseInput] = where
          return [fieldPath, op, parseInput(state)]
        })
        results.push({ filterIndex, result: { or: ors } })
        return results
      }
      return results
    }

    function hasWhereFiltersAND(payload?: QueryClause): payload is { and: WhereClause[] } {
      return !!payload && 'and' in payload && payload.and.every((clause) => isArray(clause))
    }
    function hasWhereFiltersOR(payload?: QueryClause): payload is { or: WhereClause[] } {
      return !!payload && 'or' in payload && payload.or.every((clause) => isArray(clause))
    }

    // the case where `FilterStateOption` is `WhereClause`
    if (isArray(state)) {
      results.push({ filterIndex, result: [state] })
      return results
    }

    const combinedWheres = hasWhereFiltersAND(state)
      ? combineWhereClausesWherePossible(state.and)
      : hasWhereFiltersOR(state)
      ? combineWhereClausesWherePossible(state.or)
      : 'query-with-nested-queries'

    if (combinedWheres === 'query-with-nested-queries') {
      results.push({ filterIndex, result: state })
      return results
    }

    if (!combinedWheres.length) return results

    if (hasWhereFiltersAND(state) || combinedWheres.length === 1) {
      results.push({ filterIndex, result: combinedWheres })
      return results
    }

    if (hasWhereFiltersOR(state)) {
      results.push({ filterIndex, result: { or: combinedWheres } })
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
      for (const where of whereOrQuery) {
        collection = collection.where(...where)
      }
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
