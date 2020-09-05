import { PlainObject, PluginStreamAction } from '@vue-sync/core';
import { ReactiveStoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions): PluginStreamAction;
