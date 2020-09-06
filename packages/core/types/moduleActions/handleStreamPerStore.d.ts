import { O } from 'ts-toolbelt';
import { VueSyncStreamAction, OpenStreams } from '../types/actions';
import { ActionType } from '../types/actionsInternal';
import { ModuleConfig, GlobalConfig } from '../types/config';
export declare function handleStreamPerStore([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, actionType: ActionType, openStreams: OpenStreams): VueSyncStreamAction;
