import { ActionName, PluginAction } from './types/actions';
import { VueSyncConfig } from '.';
export declare type VueSyncModuleInstance = {
    [action in ActionName]?: PluginAction;
};
export interface ModuleConfig {
    type: 'collection' | 'document';
    storeConfig?: {
        [storeName: string]: {
            path: string;
        };
    };
}
export declare function CreateModuleWithContext(moduleConfig: ModuleConfig, vueSyncConfig: VueSyncConfig): VueSyncModuleInstance;
