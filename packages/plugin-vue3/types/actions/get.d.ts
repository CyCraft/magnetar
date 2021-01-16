import { PluginGetAction } from '@magnetarjs/core';
import { Vue3StoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, Vue3StoreOptions: Vue3StoreOptions): PluginGetAction;
