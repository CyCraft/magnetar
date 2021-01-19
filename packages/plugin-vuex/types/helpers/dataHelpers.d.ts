import { Clauses } from '@magnetarjs/core';
/**
 * Filters a Collection module's data based on provided clauses.
 *
 * @param {Record<string, Record<string, any>>} collectionState
 * @param {Clauses} clauses
 * @returns {Record<string, Record<string, any>>}
 */
export declare function filterDataPerClauses(collectionState: Record<string, Record<string, any>>, clauses: Clauses): 'no-filter' | [string, Record<string, any>][];
export declare function objectToMap(object?: Record<string, any> | undefined, entriesInCustomOrder?: [string, Record<string, any>][]): Map<string, Record<string, any>>;
