import { PluginStreamAction, PluginActionPayloadBase } from '@magnetarjs/core';
import { VuexStorePluginModuleConfig, VuexStorePluginOptions } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function streamActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists'): PluginStreamAction;
