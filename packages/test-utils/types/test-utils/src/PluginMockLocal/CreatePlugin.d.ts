import { MagnetarPlugin, WhereClause, OrderByClause, Limit } from '../../../core/src';
export interface StorePluginOptions {
    generateRandomId: () => string;
    storeName: string;
}
export interface StorePluginModuleConfig {
    path?: string;
    initialData?: Record<string, any> | [string, Record<string, any>][];
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare type MakeRestoreBackup = (collectionPath: string, docId: string) => void;
export declare const CreatePlugin: MagnetarPlugin<StorePluginOptions>;
