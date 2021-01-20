import { PluginFetchAction } from '@magnetarjs/core';
import { Vue2StoreOptions } from '../CreatePlugin';
export declare function fetchActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions): PluginFetchAction;
