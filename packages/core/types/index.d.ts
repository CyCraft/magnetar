import { O } from 'ts-toolbelt';
import { ModuleConfig, VueSyncModuleInstance } from './CreateModule';
import { SharedConfig } from './types/base';
import { PluginInstance } from './types/plugins';
export declare type VueSyncConfig = O.Merge<Partial<SharedConfig>, {
    stores: {
        [storeName: string]: PluginInstance;
    };
}>;
export interface VueSyncInstance {
    globalConfig: O.Compulsory<VueSyncConfig>;
    createModule: CreateModule;
}
export declare type CreateModule = (moduleConfig: ModuleConfig) => VueSyncModuleInstance;
export declare function VueSync(vueSyncConfig: VueSyncConfig): VueSyncInstance;
