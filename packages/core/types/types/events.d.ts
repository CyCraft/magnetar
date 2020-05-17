import { O } from 'ts-toolbelt';
import { ActionName } from './actions';
import { PlainObject } from './atoms';
import { GetResponse, StreamResponse, DoOnStream, DoOnGet } from './plugins';
export declare type EventName = 'before' | 'success' | 'error' | 'revert';
declare type EventSharedPayload = {
    /**
     * write actions: PlainObject | PlainObject[]
     * delete actions: PlainObject | PlainObject[] | string | string[]
     * read actions: PlainObject | void
     */
    payload: PlainObject | PlainObject[] | void | string | string[];
    actionName: ActionName;
    storeName: string;
    /**
     * stream actions: void // streams cannot be aborted in an event
     * others: () => void
     */
    abort: () => void | void;
};
declare type EventPayloadPropResult = {
    result: void | string | GetResponse | DoOnGet | StreamResponse | DoOnStream;
};
export declare type EventFnBefore = (args: O.Merge<EventSharedPayload, {}>) => void | Promise<void>;
export declare type EventFnSuccess = (args: O.Merge<EventSharedPayload, EventPayloadPropResult>) => void | Promise<void>;
export declare type EventFnError = (args: O.Merge<EventSharedPayload, {
    error: any;
}>) => void | Promise<void>;
export declare type EventFnRevert = (args: O.Merge<O.Omit<EventSharedPayload, 'abort'>, EventPayloadPropResult>) => void | Promise<void>;
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
