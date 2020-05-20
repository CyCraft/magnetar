import { PlainObject, PluginGetAction } from '@vue-sync/core';
import { ReactiveStoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions): PluginGetAction;
