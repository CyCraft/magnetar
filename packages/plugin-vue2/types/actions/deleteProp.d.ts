import { PlainObject, PluginDeletePropAction } from '@vue-sync/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
