import { VueSyncPlugin, WhereClause, OrderByClause, Limit } from '@magnetarjs/core';
export interface SimpleStoreOptions {
    storeName: string;
    generateRandomId: () => string;
}
export interface SimpleStoreModuleConfig {
    path?: string;
    initialData?: Record<string, any> | [string, Record<string, any>][];
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: VueSyncPlugin<SimpleStoreOptions>;
