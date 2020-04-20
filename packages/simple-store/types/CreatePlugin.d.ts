import { VueSyncPlugin, PlainObject } from '@vue-sync/core';
export interface SimpleStoreOptions {
    storeName: string;
    generateRandomId: () => string;
}
export interface SimpleStoreModuleConfig {
    path?: string;
    initialData?: PlainObject | [string, PlainObject][];
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: VueSyncPlugin<SimpleStoreOptions>;
