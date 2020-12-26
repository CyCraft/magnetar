import { PluginStreamAction } from '../../../../core/src';
import { StorePluginOptions } from '../CreatePlugin';
export declare function streamActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions): PluginStreamAction;
