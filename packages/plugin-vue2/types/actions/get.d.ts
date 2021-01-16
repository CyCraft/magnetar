import { PluginGetAction } from '@magnetarjs/core';
import { Vue2StoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions): PluginGetAction;
