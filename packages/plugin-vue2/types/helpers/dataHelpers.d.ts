import { Clauses } from '@magnetarjs/core';
/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Record<string, Record<string, any>>} collectionDB
 * @param {Clauses} clauses
 * @returns {Record<string, Record<string, any>>}
 */
export declare function filterDataPerClauses(collectionDB: Record<string, Record<string, any>>, clauses: Clauses): Record<string, Record<string, any>>;
export declare function objectToMap(object: Record<string, any> | undefined): Map<string, Record<string, any>>;
