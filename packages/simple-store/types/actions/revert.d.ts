import { PlainObject, PluginRevertAction } from '@vue-sync/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, simpleStoreOptions: SimpleStoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
