import { PlainObject, PluginInsertAction } from '@vue-sync/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
