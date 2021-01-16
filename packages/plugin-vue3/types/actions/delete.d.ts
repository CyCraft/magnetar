import { PluginDeleteAction } from '@magnetarjs/core';
import { Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function deleteActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, Vue3StoreOptions: Vue3StoreOptions, makeBackup?: MakeRestoreBackup): PluginDeleteAction;
