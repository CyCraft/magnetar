import { PluginDeletePropAction } from '@vue-sync/core';
import { FirestorePluginOptions } from '../CreatePlugin';
import { BatchSync } from '../helpers/batchSync';
export declare function deletePropActionFactory(batchSync: BatchSync, firestorePluginOptions: Required<FirestorePluginOptions>): PluginDeletePropAction;
