import { O } from 'ts-toolbelt';
import { MagnetarStreamAction, OpenStreams, FindStream, OpenStreamPromises, FindStreamPromise } from '../types/actions';
import { ActionType } from '../types/actionsInternal';
import { ModuleConfig, GlobalConfig } from '../types/config';
export declare function handleStreamPerStore([collectionPath, docId]: [string, string | undefined], moduleConfig: ModuleConfig, globalConfig: O.Compulsory<GlobalConfig>, actionType: ActionType, streams: {
    openStreams: OpenStreams;
    findStream: FindStream;
    openStreamPromises: OpenStreamPromises;
    findStreamPromise: FindStreamPromise;
}): MagnetarStreamAction;
