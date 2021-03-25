import { O } from 'ts-toolbelt';
import { ActionName } from './actions';
import { FetchResponse, StreamResponse, DoOnStream, DoOnFetch, PluginModuleConfig } from './plugins';
export declare type EventName = 'before' | 'success' | 'error' | 'revert';
declare type EventSharedPayload = {
    /**
     * The path of just the collection
     * @example 'pokedex/001/items'
     * @example 'pokedex'
     */
    collectionPath: string;
    /**
     * The id of the document. When this is a nested document, it will not include the full path, only the final part
     * @example '001'
     */
    docId?: string | undefined;
    /**
     * The full path of the document or collection
     * @example 'pokedex/001'
     * @example 'pokedex/001/items'
     */
    path: string;
    /**
     * The payload that was passed to the action
     * write actions: Record<string, any> | Record<string, any>[]
     * delete actions: Record<string, any> | Record<string, any>[] | string | string[]
     * read actions: Record<string, any> | void
     */
    payload: Record<string, any> | Record<string, any>[] | void | string | string[];
    /**
     * The action name for which the current event is being run
     */
    actionName: ActionName;
    /**
     * The store name for which the current event is being run
     */
    storeName: string;
    /**
     * The module config which is passed to the store plugin for which the current event is being run
     */
    pluginModuleConfig: PluginModuleConfig;
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
