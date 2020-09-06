import { PluginDeletePropAction } from '@magnetarjs/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
