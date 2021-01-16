import { PluginWriteAction } from '@magnetarjs/core';
import { Vue3StoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function writeActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, Vue3StoreOptions: Vue3StoreOptions, actionName: 'merge' | 'assign' | 'replace', makeBackup?: MakeRestoreBackup): PluginWriteAction;
