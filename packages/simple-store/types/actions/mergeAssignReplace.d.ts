import { PlainObject, PluginWriteAction } from '@vue-sync/core';
import { SimpleStoreConfig } from '..';
export declare function writeActionFactory(moduleData: PlainObject, simpleStoreConfig: SimpleStoreConfig, makeDataSnapshot: any, actionName: 'merge' | 'assign' | 'replace'): PluginWriteAction;
