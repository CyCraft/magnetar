import { VueSyncPlugin } from '../../src/types/plugins';
import { PlainObject } from '../../src/types/base';
export interface StorePluginConfig {
    storeName: string;
}
export interface StorePluginModuleConfig {
    path?: string;
    initialData?: PlainObject | [string, PlainObject][];
}
export declare const VueSyncGenericPlugin: VueSyncPlugin;
