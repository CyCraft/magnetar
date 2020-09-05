import { PlainObject, PluginGetAction } from '@vue-sync/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions): PluginGetAction;
