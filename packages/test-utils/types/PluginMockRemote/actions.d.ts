import { PluginWriteAction, PluginDeleteAction, PluginStreamAction, PluginGetAction, PluginRevertAction, PluginDeletePropAction, PluginInsertAction } from '../../../core/src';
import { RemoteStoreOptions } from './index';
export declare function writeActionFactory(storePluginOptions: RemoteStoreOptions, actionName: 'merge' | 'assign' | 'replace'): PluginWriteAction;
export declare function insertActionFactory(storePluginOptions: RemoteStoreOptions): PluginInsertAction;
export declare function deletePropActionFactory(storePluginOptions: RemoteStoreOptions): PluginDeletePropAction;
export declare function deleteActionFactory(storePluginOptions: RemoteStoreOptions): PluginDeleteAction;
export declare function getActionFactory(storePluginOptions: RemoteStoreOptions): PluginGetAction;
export declare function streamActionFactory(storePluginOptions: RemoteStoreOptions): PluginStreamAction;
export declare function revertActionFactory(storePluginOptions: RemoteStoreOptions): PluginRevertAction;
