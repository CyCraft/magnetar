import { PlainObject, PluginInsertAction } from '@vue-sync/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
