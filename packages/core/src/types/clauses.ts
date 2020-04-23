/**
 * The operator of a where filter.
 */
export type WhereFilterOp =
  | '=='
  | '<'
  | '<='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any'

/**
 * Determines the where-filter to be applied.
 */
export type WhereClause = [string, WhereFilterOp, any]

/**
 * Sort by the specified field, optionally in descending order instead of ascending.
 */
export type OrderBy = [string, ('asc' | 'desc')?]

/**
 * The maximum number of items to return.
 */
export type Limit = number

/**
 * Clauses that can filter data in a Collection
 */
export type Clauses = {
  where?: WhereClause[]
  orderBy?: OrderBy[]
  limit?: Limit
}
