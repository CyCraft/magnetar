import { PluginInsertAction } from '@magnetarjs/core';
import { Vue2StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Record<string, Record<string, any>>;
}, vue2StoreOptions: Vue2StoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
