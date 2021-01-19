import { PluginDeletePropAction } from '@magnetarjs/core';
import { VuexStorePluginOptions, MakeRestoreBackup } from '../CreatePlugin';
import { Store } from 'vuex';
export declare function deletePropActionFactory(store: Store<Record<string, any>>, vuexStorePluginOptions: VuexStorePluginOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
