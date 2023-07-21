import { ArrayValues } from './utils/ArrayValues'
import { DeepPropType } from './utils/DeepPropType'
import { DefaultTo } from './utils/DefaultTo'
import { OPathsWithOptional } from './utils/Paths'

/**
 * The operator of a where filter.
 */
export type WhereFilterOp =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in'

/**
 * Determines the where-filter to be applied.
 *
 * This is the internal type used by the config state.
 * It has no knowledge on the actual types of the data.
 * The where clause is defined in a more complex manner at `CollectionInstance["where"]`
 */
export type WhereClause = [string, WhereFilterOp, any]

/**
 * Sort by the specified field, optionally in descending order instead of ascending.
 *
 * This is the internal type used by the config state.
 * It has no knowledge on the actual types of the data.
 * The orderBy clause is defined in a more complex manner at `CollectionInstance["orderBy"]`
 */
export type OrderByClause = [string, ('asc' | 'desc')?]

/**
 * Determines a complex queries of where-filter with ANDs and ORs.
 *
 * This is the internal type used by the config state.
 * It has no knowledge on the actual types of the data.
 * The orderBy clause is defined in a more complex manner at `CollectionInstance["query"]`
 */
export type QueryClause = { and: WhereClause[] | QueryClause } | { or: WhereClause[] | QueryClause }

/**
 * The maximum number of items to return.
 */
export type Limit = number

/**
 * Clauses that can filter data in a Collection.
 * This is used for the internal config state. Applying where clauses by the developer is done through `CollectionInstance`.
 */
export type Clauses = {
  query?: QueryClause[]
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
  startAfter?: unknown[] | any
}

export type WhereFilterValue<WFO extends WhereFilterOp, V> = WFO extends 'in' | 'not-in'
  ? V[]
  : WFO extends `array-contains`
  ? ArrayValues<V>
  : V

export type WhereClauseTuple<
  T extends Record<string, any>,
  Path extends OPathsWithOptional<T> = OPathsWithOptional<T>,
  WhereOp extends WhereFilterOp = WhereFilterOp
> = [
  fieldPath: Path,
  operator: WhereOp,
  value: WhereFilterValue<WhereOp, DefaultTo<DeepPropType<T, Path>, any>>
]

export type Query<T extends Record<string, any> = Record<string, any>> =
  | { or: WhereClauseTuple<T>[] | Query<T> }
  | { and: WhereClauseTuple<T>[] | Query<T> }
