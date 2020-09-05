import { PlainObject, PluginStreamAction } from '@magnetarjs/core';
import { ReactiveStoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions): PluginStreamAction;
