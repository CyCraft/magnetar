import { PlainObject, PluginDeleteAction } from '@vue-sync/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deleteActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeleteAction;
