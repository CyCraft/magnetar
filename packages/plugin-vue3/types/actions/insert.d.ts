import { PluginInsertAction } from '@magnetarjs/core';
import { Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, Vue3StoreOptions: Vue3StoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
