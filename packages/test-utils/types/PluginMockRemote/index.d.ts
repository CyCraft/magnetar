import { MagnetarPlugin, WhereClause, OrderByClause, Limit } from '../../../core/src';
export declare type RemoteStoreOptions = {
    storeName: string;
};
export interface StorePluginModuleConfig {
    path?: string;
    initialData?: Record<string, any> | [string, Record<string, any>][];
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare const CreatePlugin: MagnetarPlugin<RemoteStoreOptions>;
