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
 */
export type WhereClause = [string, WhereFilterOp, any]

/**
 * Sort by the specified field, optionally in descending order instead of ascending.
 */
export type OrderByClause = [string, ('asc' | 'desc')?]

/**
 * The maximum number of items to return.
 */
export type Limit = number

/**
 * Clauses that can filter data in a Collection
 */
export type Clauses = {
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

/** TODO: replace `WhereClause` with this one */
export type WhereClauseTuple<
  T extends Record<string, any>,
  Path extends OPathsWithOptional<T>,
  WhereOp extends WhereFilterOp
> = [
  fieldPath: Path,
  operator: WhereOp,
  value: WhereFilterValue<WhereOp, DefaultTo<DeepPropType<T, Path>, any>>
]
