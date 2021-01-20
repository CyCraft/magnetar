import { PluginWriteAction, PluginDeleteAction, PluginStreamAction, PluginFetchAction, PluginRevertAction, PluginDeletePropAction, PluginInsertAction } from '../../../core/src';
import { RemoteStoreOptions } from './index';
export declare function writeActionFactory(storePluginOptions: RemoteStoreOptions, actionName: 'merge' | 'assign' | 'replace'): PluginWriteAction;
export declare function insertActionFactory(storePluginOptions: RemoteStoreOptions): PluginInsertAction;
export declare function deletePropActionFactory(storePluginOptions: RemoteStoreOptions): PluginDeletePropAction;
export declare function deleteActionFactory(storePluginOptions: RemoteStoreOptions): PluginDeleteAction;
export declare function fetchActionFactory(storePluginOptions: RemoteStoreOptions): PluginFetchAction;
export declare function streamActionFactory(storePluginOptions: RemoteStoreOptions): PluginStreamAction;
export declare function revertActionFactory(storePluginOptions: RemoteStoreOptions): PluginRevertAction;
