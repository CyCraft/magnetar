import { PlainObject, PluginRevertAction } from '@vue-sync/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
