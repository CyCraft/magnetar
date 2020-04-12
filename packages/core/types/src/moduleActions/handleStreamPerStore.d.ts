import { O } from 'ts-toolbelt';
import { ActionType, VueSyncStreamAction } from '../types/actions';
import { ModuleConfig, GlobalConfig } from '../types/base';
export declare function handleStreamPerStore(modulePath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, actionType: ActionType, openStreams: {
    [identifier: string]: () => void;
}): VueSyncStreamAction;
