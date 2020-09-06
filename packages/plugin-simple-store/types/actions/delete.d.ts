import { PluginDeleteAction } from '@magnetarjs/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deleteActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeleteAction;
