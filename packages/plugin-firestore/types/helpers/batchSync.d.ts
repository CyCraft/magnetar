import { FirestorePluginOptions } from '../CreatePlugin';
import type firebase from 'firebase';
declare type SetOptions = firebase.firestore.SetOptions;
export declare type BatchSync = {
    set: (documentPath: string, payload: Record<string, any>, options?: SetOptions) => Promise<void>;
    update: (documentPath: string, payload: Record<string, any>) => Promise<void>;
    delete: (documentPath: string) => Promise<void>;
};
/**
 * Creates a BatchSync instance that will sync to firestore and automatically debounce
 *
 * @export
 * @returns {BatchSync}
 */
export declare function batchSyncFactory(firestorePluginOptions: Required<FirestorePluginOptions>): BatchSync;
export {};
