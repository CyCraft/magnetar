import { PluginGetAction } from '../../../../core/src';
import { StorePluginOptions } from '../CreatePlugin';
export declare function getActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions): PluginGetAction;
