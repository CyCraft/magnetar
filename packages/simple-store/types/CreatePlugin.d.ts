import { VueSyncPlugin, PlainObject } from '@vue-sync/core';
export interface SimpleStoreConfig {
    storeName: string;
    generateRandomId: () => string;
}
export interface StorePluginModuleConfig {
    path?: string;
    initialData?: PlainObject | [string, PlainObject][];
}
export declare const CreatePlugin: VueSyncPlugin<SimpleStoreConfig>;
