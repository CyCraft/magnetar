import { PluginGetAction, PluginActionPayloadBase } from '@magnetarjs/core';
import { VuexStorePluginModuleConfig, VuexStorePluginOptions } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function getActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, setupModule: (payload: PluginActionPayloadBase<VuexStorePluginModuleConfig>) => void | 'exists'): PluginGetAction;
