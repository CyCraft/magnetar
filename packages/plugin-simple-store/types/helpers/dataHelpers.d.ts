import { PlainObject, Clauses } from '@vue-sync/core';
/**
 * Filters a Collection module's data map `Map<string, DocData>` based on provided clauses.
 *
 * @param {Map<string, PlainObject>} collectionDB
 * @param {Clauses} clauses
 * @returns {Map<string, PlainObject>}
 */
export declare function filterDataPerClauses(collectionDB: Map<string, PlainObject>, clauses: Clauses): Map<string, PlainObject>;
