import { PluginDeletePropAction } from '../../../../core/src';
import { StorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
