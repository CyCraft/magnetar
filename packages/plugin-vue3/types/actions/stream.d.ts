import { PluginStreamAction } from '@magnetarjs/core';
import { Vue3StoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, Vue3StoreOptions: Vue3StoreOptions): PluginStreamAction;
