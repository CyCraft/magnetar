import { PluginGetAction } from '@magnetarjs/core';
import { ReactiveStoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: ReactiveStoreOptions): PluginGetAction;
