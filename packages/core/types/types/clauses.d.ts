/**
 * The operator of a where filter.
 */
export declare type WhereFilterOp = '==' | '<' | '<=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any';
/**
 * Determines the where-filter to be applied.
 */
export declare type WhereClause = [string, WhereFilterOp, any];
/**
 * Sort by the specified field, optionally in descending order instead of ascending.
 */
export declare type OrderByClause = [string, ('asc' | 'desc')?];
/**
 * The maximum number of items to return.
 */
export declare type Limit = number;
/**
 * Clauses that can filter data in a Collection
 */
export declare type Clauses = {
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
};
