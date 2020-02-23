import { O } from 'ts-toolbelt';
import { ActionName, VueSyncAction } from './types/actions';
import { SharedConfig } from './types/base';
import { VueSyncConfig } from '.';
export declare type VueSyncModuleInstance = {
    [action in ActionName]?: VueSyncAction;
};
export declare type ModuleType = 'collection' | 'document';
export declare type ModuleConfig = O.Merge<Partial<SharedConfig>, {
    type: ModuleType;
    configPerStore?: {
        [storeName: string]: {
            [key: string]: any;
        };
    };
}>;
export declare function CreateModuleWithContext(moduleConfig: ModuleConfig, globalConfig: O.Compulsory<VueSyncConfig>): VueSyncModuleInstance;
