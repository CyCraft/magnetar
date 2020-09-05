import { PlainObject, PluginDeleteAction } from '@vue-sync/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deleteActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeleteAction;
