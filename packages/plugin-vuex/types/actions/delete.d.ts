import { PluginDeleteAction } from '@magnetarjs/core';
import { VuexStorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function deleteActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, makeBackup?: MakeRestoreBackup): PluginDeleteAction;
