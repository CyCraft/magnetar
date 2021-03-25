import { O } from 'ts-toolbelt';
import { ActionName } from './actions';
import { FetchResponse, StreamResponse, DoOnStream, DoOnFetch } from './plugins';
export declare type EventName = 'before' | 'success' | 'error' | 'revert';
declare type EventSharedPayload = {
    collectionPath: string;
    docId?: string | undefined;
    /**
     * write actions: Record<string, any> | Record<string, any>[]
     * delete actions: Record<string, any> | Record<string, any>[] | string | string[]
     * read actions: Record<string, any> | void
     */
    payload: Record<string, any> | Record<string, any>[] | void | string | string[];
    actionName: ActionName;
    storeName: string;
    /**
     * stream actions: void // streams cannot be aborted in an event
     * others: () => void
     */
    abort: () => void;
};
declare type EventPayloadPropResult = {
    result: void | string | FetchResponse | DoOnFetch | StreamResponse | DoOnStream;
};
export declare type EventFnBefore = (args: EventSharedPayload) => void | Promise<void>;
export declare type EventFnSuccess = (args: O.Patch<EventSharedPayload, EventPayloadPropResult>) => void | Promise<void>;
export declare type EventFnError = (args: O.Patch<EventSharedPayload, {
    error: any;
}>) => void | Promise<void>;
export declare type EventFnRevert = (args: O.Patch<O.Omit<EventSharedPayload, 'abort'>, EventPayloadPropResult>) => void | Promise<void>;
export declare type EventFn = EventFnBefore | EventFnSuccess | EventFnError | EventFnRevert;
export declare type EventNameFnMap = {
    before?: EventFnBefore;
    success?: EventFnSuccess;
    error?: EventFnError;
    revert?: EventFnRevert;
};
export declare type EventNameFnsMap = {
    before: EventFnBefore[];
    success: EventFnSuccess[];
    error: EventFnError[];
    revert: EventFnRevert[];
};
export declare function getEventNameFnsMap(...onMaps: (EventNameFnMap | void)[]): EventNameFnsMap;
export {};
