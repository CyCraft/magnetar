import { O } from 'ts-toolbelt';
import { ActionName } from './actions';
import { DocMetadata } from './atoms';
import { OnAddedFn, OnModifiedFn, OnRemovedFn } from './modifyReadResponse';
import { Clauses } from './clauses';
/**
 * A Plugin is a single function that returns a plugin instance. The pluginOptions can be anything the plugin might need to instantiate.
 */
export declare type MagnetarPlugin<PluginOptions> = (pluginOptions: PluginOptions) => PluginInstance;
/**
 * The PluginInstance is what a Store Plugin must return. The plugin must implement end-points for each possible action the dev might trigger.
 */
export interface PluginInstance {
    actions: {
        fetch?: PluginFetchAction;
        stream?: PluginStreamAction;
        insert?: PluginInsertAction;
        merge?: PluginWriteAction;
        assign?: PluginWriteAction;
        replace?: PluginWriteAction;
        deleteProp?: PluginDeletePropAction;
        delete?: PluginDeleteAction;
    };
    /**
     * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the payload and actionName parameters to revert the state to before.
     */
    revert: PluginRevertAction;
    /**
     * This must be provided by Store Plugins that have "local" data. It is triggered ONCE when the module (doc or collection) is instantiated. In any case, an empty Map for the collectionPath (to be derived from the modulePath) must be set up.
     */
    setupModule?: (pluginActionPayload: PluginActionPayloadBase) => void;
    /**
     * This must be provided by Store Plugins that have "local" data. It is triggered EVERY TIME the module's data is accessed. The `modulePath` will be either that of a "collection" or a "doc". When it's a collection, it must return a Map with the ID as key and the doc data as value `Map<string, DocDataType>`. When it's a "doc" it must return the doc data directly `DocDataType`.
     */
    getModuleData?: (pluginActionPayload: PluginActionPayloadBase) => Record<string, any> | Map<string, Record<string, any>>;
}
/**
 * Where, orderBy, limit clauses or extra config a dev might pass when instanciates a module as second param (under `configPerStore`). Eg. `collection('pokedex', { configPerStore: { local: pluginModuleConfig } })`
 */
export declare type PluginModuleConfig = O.Patch<Clauses, {
    [key: string]: any;
}>;
export declare type PluginActionPayloadBase<SpecificPluginModuleConfig = PluginModuleConfig> = {
    /**
     * The collection path the action was called on.
     */
    collectionPath: string;
    /**
     * The doc id the action was called on. If `undefined` it means the action is being triggered on a collection.
     */
    docId: string | undefined;
    /**
     * Represents the pluginModuleConfig on which the action is triggered. The developer that uses the plugin will pass the `pluginModuleConfig` like so: `collection('myCollection', { configPerStore: { storeName: pluginModuleConfig } })`
     */
    pluginModuleConfig: SpecificPluginModuleConfig;
};
export declare type PluginStreamActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any> | void;
    /**
     * MustExecuteOnRead:
     * The functions for 'added', 'modified' and 'removed' **must** be executed by the plugin whenever the stream sees any of these changes. These are the functions that will pass the data to the other "local" Store Plugins.
     */
    mustExecuteOnRead: MustExecuteOnRead;
}>;
/**
 * Should handle 'stream' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc). Should return `StreamResponse` when acting as a "remote" Store Plugin, and `DoOnStream` when acting as "local" Store Plugin.
 */
export declare type PluginStreamAction = (payload: PluginStreamActionPayload) => StreamResponse | DoOnStream | Promise<StreamResponse | DoOnStream>;
export declare type PluginFetchActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any> | void;
}>;
/**
 * Should handle 'fetch' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc). Should return `FetchResponse` when acting as a "remote" Store Plugin, and `DoOnFetch` when acting as "local" Store Plugin.
 */
export declare type PluginFetchAction = (payload: PluginFetchActionPayload) => FetchResponse | DoOnFetch | Promise<FetchResponse | DoOnFetch>;
export declare type PluginWriteActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any>;
}>;
/**
 * Should handle 'merge' 'assign' 'replace' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 */
export declare type PluginWriteAction = (payload: PluginWriteActionPayload) => void | Promise<void>;
export declare type PluginInsertActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any>;
}>;
/**
 * Should handle 'insert' for collections & docs. Must return the new document's ID! When executed on a collection, the plugin must provide a newly generated ID. (use `getCollectionPathDocIdEntry(modulePath)` helper, based on what it returns, you know if it's a collection or doc)
 */
export declare type PluginInsertAction = (payload: PluginInsertActionPayload) => string | Promise<string>;
export declare type PluginDeletePropActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: string | string[];
    /**
     * docId must be provided
     */
    docId: string;
}>;
/**
 * Should handle 'deleteProp' for docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 */
export declare type PluginDeletePropAction = (payload: PluginDeletePropActionPayload) => void | Promise<void>;
export declare type PluginDeleteActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: void | any;
}>;
/**
 * Should handle 'delete' for collections & docs. (use `getCollectionPathDocIdEntry(modulePath)` helper)
 */
export declare type PluginDeleteAction = (payload: PluginDeleteActionPayload) => void | Promise<void>;
export declare type PluginRevertActionPayload<SpecificPluginModuleConfig = PluginModuleConfig> = O.Patch<PluginActionPayloadBase<SpecificPluginModuleConfig>, {
    /**
     * Whatever payload was passed to the action that was triggered
     */
    payload: Record<string, any> | Record<string, any>[] | void | string | string[];
    /**
     * Whatever action was originally triggered when an error was thrown. This is the action that will need to be reverted by this function.
     */
    actionName: ActionName;
    /**
     * Whatever error was thrown that caused the need for reverting.
     */
    error: any;
}>;
/**
 * The 'revert' action is triggered when another Store Plugin had an error during the execution of an action, and any changes already made need to be reverted. Please use the `payload` and `actionName` parameters to determine how to revert the plugin's state to its previous state.
 */
export declare type PluginRevertAction = (payload: PluginRevertActionPayload) => void | Promise<void>;
export declare type PluginActionTernary<TActionName extends ActionName> = TActionName extends 'stream' ? PluginStreamAction : TActionName extends 'fetch' ? PluginFetchAction : TActionName extends 'delete' ? PluginDeleteAction : TActionName extends 'deleteProp' ? PluginDeletePropAction : TActionName extends 'insert' ? PluginInsertAction : PluginWriteAction;
/**
 * Plugin's response to a 'stream' action, when acting as a "remote" Store Plugin.
 */
export declare type StreamResponse = {
    streaming: Promise<void>;
    stop: () => void;
};
/**
 * Plugin's response to a 'stream' action, when acting as a "local" Store Plugin.
 */
export declare type DoOnStream = {
    /**
     * 'added' is/should be triggered per document on 3 occasions: on 'fetch' when a document is read; on 'stream' when initial documents are read; on 'stream' when there are consequent insertions of documents on the end-point.
     */
    added?: OnAddedFn;
    /**
     * 'modified' is/should be triggered per document on 1 occasion: on 'stream' when a document that was already read through that stream once before is modified on the end-point.
     */
    modified?: OnModifiedFn;
    /**
     * 'removed' is/should be triggered per document on 2 occasions: on 'stream' when a document is "deleted" on the end-point; when a document doesn't adhere to the "stream clauses" any more.
     */
    removed?: OnRemovedFn;
};
/**
 * internal
 */
export declare type DoOnStreamFns = {
    added: OnAddedFn[];
    modified: OnModifiedFn[];
    removed: OnRemovedFn[];
};
/**
 * MustExecuteOnRead:
 * The functions for 'added', 'modified' and 'removed' **must** be executed by the plugin whenever the stream sees any of these changes. These are the functions that will pass the data to the other "local" Store Plugins.
 */
export declare type MustExecuteOnRead = O.Compulsory<DoOnStream>;
/**
 * DoOnStream type guard
 */
export declare function isDoOnStream(payload: any): payload is DoOnStream;
/**
 * Plugin's response to a 'fetch' action, when acting as a "remote" Store Plugin.
 */
export declare type FetchResponse = {
    docs: DocMetadata[];
};
/**
 * Plugin's response to a 'fetch' action, when acting as a "local" Store Plugin.
 */
export declare type DoOnFetch = OnAddedFn;
/**
 * DoOnFetch type guard
 */
export declare function isDoOnFetch(payload: any): payload is DoOnFetch;
/**
 * FetchResponse type guard
 */
export declare function isFetchResponse(payload: any): payload is FetchResponse;
