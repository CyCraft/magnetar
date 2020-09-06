import { PluginStreamAction } from '@magnetarjs/core';
import { ReactiveStoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: ReactiveStoreOptions): PluginStreamAction;
