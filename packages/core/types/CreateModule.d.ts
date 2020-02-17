import { O } from 'ts-toolbelt';
import { ActionName, VueSyncAction } from './types/actions';
import { Config } from './types/base';
import { VueSyncConfig } from '.';
export declare type VueSyncModuleInstance = {
    [action in ActionName]?: VueSyncAction;
};
export declare type ModuleConfig = O.Merge<Partial<Config>, {
    type: 'collection' | 'document';
    storeConfig?: {
        [storeName: string]: {
            path: string;
        };
    };
}>;
export declare function CreateModuleWithContext(moduleConfig: ModuleConfig, globalConfig: O.Compulsory<VueSyncConfig>): VueSyncModuleInstance;
