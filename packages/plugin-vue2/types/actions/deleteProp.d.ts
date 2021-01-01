import { PluginDeletePropAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: Vue2StoreOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
