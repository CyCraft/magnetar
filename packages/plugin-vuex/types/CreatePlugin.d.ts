import { Store, GetterTree, MutationTree, ActionTree } from 'vuex';
import { MagnetarPlugin, WhereClause, OrderByClause, Limit } from '@magnetarjs/core';
export interface VuexStorePluginOptions {
    store: Store<Record<string, any>>;
    generateRandomId: () => string;
}
export interface VuexStorePluginModuleConfig {
    path?: string;
    state?: Record<string, any>;
    mutations?: MutationTree<Record<string, any>>;
    actions?: ActionTree<Record<string, any>, Record<string, any>>;
    getters?: GetterTree<Record<string, any>, Record<string, any>>;
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: MagnetarPlugin<VuexStorePluginOptions>;
