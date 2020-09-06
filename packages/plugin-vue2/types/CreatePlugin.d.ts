import { VueSyncPlugin, WhereClause, OrderByClause, Limit } from '@magnetarjs/core';
export interface ReactiveStoreOptions {
    /**
     * This is required to make sure there are not two instances of Vue running which can cause issues.
     */
    vueInstance: any;
    storeName: string;
    generateRandomId: () => string;
}
export interface ReactiveStoreModuleConfig {
    path?: string;
    initialData?: Record<string, any> | [string, Record<string, any>][];
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: VueSyncPlugin<ReactiveStoreOptions>;
