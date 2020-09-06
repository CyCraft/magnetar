import { StreamResponse, DoOnStreamFns } from '../types/plugins';
export declare function logError(errorMessage: string): void;
export declare function logErrorAndThrow(errorMessage: string): void;
export declare function throwOnIncompleteStreamResponses(streamInfoPerStore: {
    [storeName: string]: StreamResponse;
}, doOnStreamFns: DoOnStreamFns): void;
export declare function throwIfNoFnsToExecute(storesToExecute: string[]): void;
export declare function throwIfNoDataStoreName(dataStoreName: string): void;
export declare function throwIfInvalidModulePath(modulePath: string, moduleType: 'collection' | 'doc'): void;
