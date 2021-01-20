import { PluginFetchAction } from '../../../../core/src';
import { StorePluginOptions } from '../CreatePlugin';
export declare function fetchActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, storePluginOptions: StorePluginOptions): PluginFetchAction;
