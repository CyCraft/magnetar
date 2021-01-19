import { PluginRevertAction } from '@magnetarjs/core';
import { VuexStorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function revertActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, restoreBackup: MakeRestoreBackup): PluginRevertAction;
