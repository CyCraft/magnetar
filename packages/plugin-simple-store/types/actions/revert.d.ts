import { PluginRevertAction } from '@magnetarjs/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
