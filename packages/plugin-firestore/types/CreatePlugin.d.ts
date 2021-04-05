import type firebase from 'firebase';
import { MagnetarPlugin, ModuleConfig } from '@magnetarjs/core';
declare type Firestore = firebase.firestore.Firestore;
export interface FirestorePluginOptions {
    /**
     * This is required to make sure there are not two instances of Firestore running which can cause issues.
     */
    firestoreInstance: Firestore;
    /**
     * When this is true, the "modulePath" will be used as firestorePath to sync the data to. Eg. `collection('todos')` will sync data to `todos` on firestore. When this is false (default) the firestorePath must be provided like so: `collection('todos', { firestorePath: 'myTodos' })`
     */
    useModulePathsForFirestore?: boolean;
    /**
     * Defaults to 1000ms. The amount of milliseconds before an action is synced to Firestore. Every time a consecutive action is triggered the debounce will reset.
     */
    syncDebounceMs?: number;
    /**
     * Logs extra information in the developer console every time it interacts with the server.
     *
     * Be sure to disable this on production!
     */
    debug?: boolean;
}
export interface FirestoreModuleConfig extends ModuleConfig {
    firestorePath?: string;
}
export declare const CreatePlugin: MagnetarPlugin<FirestorePluginOptions>;
export {};
