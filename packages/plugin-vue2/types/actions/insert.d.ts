import { PluginInsertAction } from '@magnetarjs/core';
import { ReactiveStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, reactiveStoreOptions: ReactiveStoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
