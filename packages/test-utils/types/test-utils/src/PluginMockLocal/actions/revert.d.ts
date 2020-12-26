import { PluginRevertAction } from '../../../../core/src';
import { StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function revertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
