import { PluginGetAction } from '@magnetarjs/core';
import { Vue2StoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: Vue2StoreOptions): PluginGetAction;
