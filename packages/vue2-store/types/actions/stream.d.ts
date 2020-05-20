import { PlainObject, PluginStreamAction } from '@vue-sync/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions): PluginStreamAction;
