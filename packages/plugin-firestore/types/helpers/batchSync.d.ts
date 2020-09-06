import { FirestorePluginOptions } from '../CreatePlugin';
import { firestore } from 'firebase';
export declare type BatchSync = {
    set: (documentPath: string, payload: Record<string, any>, options?: firestore.SetOptions) => Promise<void>;
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
