import { PluginActionPayloadBase, PluginInsertAction } from '@magnetarjs/core';
import { VuexStorePluginModuleConfig, VuexStorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function insertActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists', makeBackup?: MakeRestoreBackup): PluginInsertAction;
