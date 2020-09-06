export declare function isDocModule(path: string): boolean;
export declare function isCollectionModule(path: string): boolean;
declare type CollectionPath = string;
declare type DocId = string | undefined;
/**
 * Returns a tuple with `[CollectionPath, DocId]` if the `DocId` is `undefined` that means that the `modulePath` passed is a collection!
 *
 * @param {string} modulePath
 * @returns {[CollectionPath, DocId]} is [string, string | undefined]
 */
export declare function getCollectionPathDocIdEntry(modulePath: string): [CollectionPath, DocId];
export {};
