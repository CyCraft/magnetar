import { PluginDeletePropAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deletePropActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions, makeBackup?: MakeRestoreBackup): PluginDeletePropAction;
