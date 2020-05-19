import { PluginDeleteAction } from '@vue-sync/core';
import { FirestorePluginOptions } from '../CreatePlugin';
import { BatchSync } from '../helpers/batchSync';
export declare function deleteActionFactory(batchSync: BatchSync, firestorePluginOptions: Required<FirestorePluginOptions>): PluginDeleteAction;
