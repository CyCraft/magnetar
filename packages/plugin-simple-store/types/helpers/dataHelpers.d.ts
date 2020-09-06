import { Clauses } from '@magnetarjs/core';
/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Map<string, Record<string, any>>} collectionDB
 * @param {Clauses} clauses
 * @returns {Map<string, Record<string, any>>}
 */
export declare function filterDataPerClauses(collectionDB: Map<string, Record<string, any>>, clauses: Clauses): Map<string, Record<string, any>>;
