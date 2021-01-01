import { PluginRevertAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: Vue2StoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
