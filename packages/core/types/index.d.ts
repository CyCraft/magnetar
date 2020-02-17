import { O } from 'ts-toolbelt';
import { CreateModuleWithContext, ModuleConfig } from './CreateModule';
import { Config, PluginInstance } from './types/base';
export declare type VueSyncConfig = O.Merge<Partial<Config>, {
    stores: {
        [storeName: string]: PluginInstance;
    };
}>;
export interface VueSyncInstance {
    globalConfig: O.Compulsory<VueSyncConfig>;
    createModule: (moduleConfig: ModuleConfig) => ReturnType<typeof CreateModuleWithContext>;
}
export declare function VueSync(vueSyncConfig: VueSyncConfig): VueSyncInstance;
