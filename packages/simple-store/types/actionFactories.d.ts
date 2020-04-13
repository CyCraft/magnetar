import { PlainObject, ActionName, PluginWriteAction, PluginDeleteAction, PluginStreamAction, PluginGetAction, PluginRevertAction, PluginDeletePropAction, PluginInsertAction } from '@vue-sync/core';
import { SimpleStoreConfig } from '.';
export declare function writeActionFactory(moduleData: PlainObject, actionName: 'merge' | 'assign' | 'replace', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginWriteAction;
export declare function insertActionFactory(moduleData: PlainObject, actionName: 'insert', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginInsertAction;
export declare function deletePropActionFactory(moduleData: PlainObject, actionName: 'deleteProp', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginDeletePropAction;
export declare function deleteActionFactory(moduleData: PlainObject, actionName: ActionName | 'revert', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginDeleteAction;
export declare function getActionFactory(moduleData: PlainObject, actionName: ActionName | 'revert', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginGetAction;
export declare function streamActionFactory(moduleData: PlainObject, actionName: ActionName | 'revert', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginStreamAction;
export declare function revertActionFactory(moduleData: PlainObject, actionName: ActionName | 'revert', simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot?: any, restoreDataSnapshot?: any): PluginRevertAction;
