import { ActionType, ActionName, VueSyncError, VueSyncAction } from './actions';
import { O } from 'ts-toolbelt';
export declare type PlainObject = {
    [key: string]: any;
};
export declare type StoreName = string;
export declare type EventName = 'before' | 'success' | 'error' | 'revert';
export declare type EventFnBefore = <T extends PlainObject>(args: {
    payload: T;
    actionName: ActionName;
    abort: () => void;
}) => Partial<T> | Promise<Partial<T>>;
export declare type EventFnSuccess = <T extends PlainObject>(args: {
    payload: T;
    actionName: ActionName;
    abort: () => void;
}) => Partial<T> | Promise<Partial<T>>;
export declare type EventFnError = <T extends PlainObject>(args: {
    payload: T;
    actionName: ActionName;
    abort: () => void;
    error: VueSyncError;
}) => Partial<T> | Promise<Partial<T>>;
export declare type EventFnRevert = <T extends PlainObject>(args: {
    payload: T;
    actionName: ActionName;
}) => Partial<T> | Promise<Partial<T>>;
export declare type EventFn = EventFnBefore | EventFnSuccess | EventFnError | EventFnRevert;
export declare type EventNameFnsMap = {
    before?: EventFnBefore[];
    success?: EventFnSuccess[];
    error?: EventFnError[];
    revert?: EventFnRevert[];
};
export declare function eventFnsMapWithDefaults(eventNameFnsMap?: EventNameFnsMap): O.Compulsory<EventNameFnsMap>;
export declare type EventFnsPerStore = {
    [storeName: string]: EventNameFnsMap;
};
export interface Config {
    executionOrder: {
        [actionType in ActionType]?: StoreName[];
    } & {
        [action in ActionName]?: StoreName[];
    };
    onError: 'stop' | 'continue' | 'revert';
    on: {
        [storeName: string]: {
            before?: EventFnBefore;
            success?: EventFnSuccess;
            error?: EventFnError;
            revert?: EventFnRevert;
        };
    };
}
export interface PluginInstance {
    actions: {
        [action in ActionName]?: VueSyncAction;
    };
    revert: <T extends PlainObject>(payload: T, actionName: ActionName) => Promise<T>;
    config: {
        [key: string]: any;
    };
}
