import { PluginInsertAction } from '../../../../core/src';
import { StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
