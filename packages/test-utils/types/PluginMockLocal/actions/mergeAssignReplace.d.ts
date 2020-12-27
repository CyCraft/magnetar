import { PluginWriteAction } from '../../../../core/src';
import { StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function writeActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions, actionName: 'merge' | 'assign' | 'replace', makeBackup?: MakeRestoreBackup): PluginWriteAction;
