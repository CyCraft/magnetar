import { PluginActionPayloadBase, PluginWriteAction } from '@magnetarjs/core';
import { VuexStorePluginModuleConfig, VuexStorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function writeActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists', actionName: 'merge' | 'assign' | 'replace', makeBackup?: MakeRestoreBackup): PluginWriteAction;
