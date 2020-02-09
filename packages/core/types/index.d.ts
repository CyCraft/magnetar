import { ActionName, PluginAction, ActionType } from './types/actions';
import { CreateModuleWithContext, ModuleConfig } from './CreateModule';
declare type StoreName = string;
export interface VueSyncConfig {
    stores: {
        [storeName: string]: {
            actions: {
                [action in ActionName]?: PluginAction;
            };
            config: {
                [key: string]: any;
            };
        };
    };
    executionOrder: {
        [actionType in ActionType]?: StoreName[];
    } & {
        [action in ActionName]?: StoreName[];
    };
}
export interface VueSyncInstance {
    config: VueSyncConfig;
    createModule: (moduleConfig: ModuleConfig) => ReturnType<typeof CreateModuleWithContext>;
}
export declare function VueSync(vueSyncConfig: VueSyncConfig): VueSyncInstance;
export {};
