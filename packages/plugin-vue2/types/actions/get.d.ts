import { PlainObject, PluginGetAction } from '@magnetarjs/core';
import { ReactiveStoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions): PluginGetAction;
