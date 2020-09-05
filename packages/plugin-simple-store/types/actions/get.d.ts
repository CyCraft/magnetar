import { PlainObject, PluginGetAction } from '@magnetarjs/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions): PluginGetAction;
