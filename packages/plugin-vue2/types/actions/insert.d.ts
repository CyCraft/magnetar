import { PluginInsertAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: Vue2StoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
