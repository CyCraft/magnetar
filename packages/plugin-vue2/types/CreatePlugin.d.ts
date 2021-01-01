import { MagnetarPlugin, WhereClause, OrderByClause, Limit } from '@magnetarjs/core';
export interface Vue2StoreOptions {
    /**
     * This is required to make sure there are not two instances of Vue running which can cause issues.
     */
    vueInstance: any;
    /**
     * To support optimistic UI you need to provide a function that can generate unique IDs.
     * @example () => firestore.collection('random').doc().id
     */
    generateRandomId: () => string;
}
export interface Vue2StoreModuleConfig {
    path?: string;
    initialData?: Record<string, any> | [string, Record<string, any>][];
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
/**
 * a Vue Sync plugin is a single function that returns a `PluginInstance`
 * the plugin implements the logic for all actions that a can be called from a Vue Sync module instance
 * each action must have the proper for both collection and doc type modules
 */
export declare const CreatePlugin: MagnetarPlugin<Vue2StoreOptions>;
