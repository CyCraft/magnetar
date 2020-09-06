import { PluginGetAction } from '@magnetarjs/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions): PluginGetAction;
