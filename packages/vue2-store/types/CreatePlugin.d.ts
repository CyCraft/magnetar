import { VueSyncPlugin, PlainObject, WhereClause, OrderByClause, Limit } from '@vue-sync/core';
export interface ReactiveStoreOptions {
    storeName: string;
    generateRandomId: () => string;
}
export interface ReactiveStoreModuleConfig {
    path?: string;
    initialData?: PlainObject | [string, PlainObject][];
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: VueSyncPlugin<ReactiveStoreOptions>;
