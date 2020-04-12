import { O } from 'ts-toolbelt';
import { VueSyncStreamAction } from '../types/actions';
import { ActionType } from '../types/actionsInternal';
import { ModuleConfig, GlobalConfig } from '../types/config';
export declare function handleStreamPerStore(modulePath: string, moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, actionType: ActionType, openStreams: {
    [identifier: string]: () => void;
}): VueSyncStreamAction;
