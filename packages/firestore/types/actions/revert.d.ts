import { PluginRevertAction, PluginInstance } from '@vue-sync/core';
import { FirestorePluginOptions } from '../CreatePlugin';
export declare function revertActionFactory(actions: PluginInstance['actions'], firestorePluginOptions: Required<FirestorePluginOptions>): PluginRevertAction;
