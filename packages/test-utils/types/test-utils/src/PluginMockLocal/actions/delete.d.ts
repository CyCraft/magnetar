import { PluginDeleteAction } from '../../../../core/src';
import { StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deleteActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions, makeBackup?: MakeRestoreBackup): PluginDeleteAction;
