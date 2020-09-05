import { PlainObject, PluginStreamAction } from '@magnetarjs/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions): PluginStreamAction;
