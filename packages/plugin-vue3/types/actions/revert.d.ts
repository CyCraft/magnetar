import { PluginRevertAction } from '@magnetarjs/core';
import { Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, Vue3StoreOptions: Vue3StoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
