import { PlainObject, PluginWriteAction } from '@vue-sync/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function writeActionFactory(data: {
    [collectionPath: string]: Map<string, PlainObject>;
}, reactiveStoreOptions: ReactiveStoreOptions, actionName: 'merge' | 'assign' | 'replace', makeBackup?: MakeRestoreBackup): PluginWriteAction;
