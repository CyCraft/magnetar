import { PluginRevertAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
