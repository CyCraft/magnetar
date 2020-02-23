import { ActionName } from './actions';
import { PlainObject } from './base';
import { ModuleType } from '../CreateModule';
export declare type Plugin = (any: any) => PluginInstance;
export interface PluginInstance {
    actions: {
        [action in ActionName]?: PluginAction;
    };
    revert: PluginRevertAction;
    config: {
        [key: string]: any;
    };
}
export interface PluginActionConfig {
    moduleType: ModuleType;
    moduleConfig: {
        [key: string]: any;
    };
}
export declare type PluginReadAction = <T extends PlainObject>(payload: T, pluginActionConfig?: PluginActionConfig) => Promise<Partial<T>>;
export declare type PluginWriteAction = <T extends PlainObject>(payload: T, pluginActionConfig?: PluginActionConfig) => Promise<Partial<T>>;
export declare type PluginAction = PluginReadAction | PluginWriteAction;
export declare type PluginRevertAction = <T extends PlainObject>(actionName: ActionName, payload: T, pluginActionConfig: PluginActionConfig) => Promise<T>;
