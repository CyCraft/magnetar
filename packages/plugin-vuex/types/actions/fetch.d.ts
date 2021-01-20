import { PluginFetchAction, PluginActionPayloadBase } from '@magnetarjs/core';
import { VuexStorePluginModuleConfig, VuexStorePluginOptions } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function fetchActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists'): PluginFetchAction;
