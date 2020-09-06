import { PluginInsertAction } from '@magnetarjs/core';
import { SimpleStoreOptions, MakeRestoreBackup } from '../CreatePlugin';
export declare function insertActionFactory(data: {
    [collectionPath: string]: Map<string, Record<string, any>>;
}, simpleStoreOptions: SimpleStoreOptions, makeBackup?: MakeRestoreBackup): PluginInsertAction;
