import { PluginRevertAction, PluginInstance } from '@magnetarjs/core';
import { FirestorePluginOptions } from '../CreatePlugin';
export declare function revertActionFactory(actions: PluginInstance['actions'], firestorePluginOptions: Required<FirestorePluginOptions>): PluginRevertAction;
