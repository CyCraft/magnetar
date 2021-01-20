import { PluginFetchAction } from '@magnetarjs/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function fetchActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions): PluginFetchAction;
