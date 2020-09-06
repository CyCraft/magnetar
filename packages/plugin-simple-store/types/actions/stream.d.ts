import { PluginStreamAction } from '@magnetarjs/core';
import { SimpleStoreOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions): PluginStreamAction;
