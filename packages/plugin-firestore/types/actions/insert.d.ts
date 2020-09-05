import { PluginInsertAction } from '@vue-sync/core';
import { FirestorePluginOptions } from '../CreatePlugin';
import { BatchSync } from '../helpers/batchSync';
export declare function insertActionFactory(batchSync: BatchSync, firestorePluginOptions: Required<FirestorePluginOptions>): PluginInsertAction;
