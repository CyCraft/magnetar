import { PluginWriteAction } from '@magnetarjs/core';
import { FirestorePluginOptions } from '../CreatePlugin';
import { BatchSync } from '../helpers/batchSync';
export declare function writeActionFactory(batchSync: BatchSync, firestorePluginOptions: Required<FirestorePluginOptions>, actionName: 'merge' | 'assign' | 'replace'): PluginWriteAction;
