import { PluginStreamAction } from '@magnetarjs/core';
import { Vue2StoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions): PluginStreamAction;
