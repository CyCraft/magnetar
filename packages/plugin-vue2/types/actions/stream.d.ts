import { PluginStreamAction } from '@magnetarjs/core';
import { Vue2StoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: Vue2StoreOptions): PluginStreamAction;
