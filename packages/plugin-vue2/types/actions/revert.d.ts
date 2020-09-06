import { PluginRevertAction } from '@magnetarjs/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: ReactiveStoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
