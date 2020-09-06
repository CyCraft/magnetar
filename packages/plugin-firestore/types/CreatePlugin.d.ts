import { firestore } from 'firebase';
import { VueSyncPlugin, WhereClause, OrderByClause, Limit } from '@magnetarjs/core';
export interface FirestorePluginOptions {
    /**
     * This is required to make sure there are not two instances of Firestore running which can cause issues.
     */
    firestoreInstance: firestore.Firestore;
    /**
     * When this is true, the "modulePath" will be used as firestorePath to sync the data to. Eg. `collection('todos')` will sync data to `todos` on firestore. When this is false (default) the firestorePath must be provided like so: `collection('todos', { firestorePath: 'myTodos' })`
     */
    useModulePathsForFirestore?: boolean;
    /**
     * Defaults to 1000ms. The amount of milliseconds before an action is synced to Firestore. Every time a consecutive action is triggered the debounce will reset.
     */
    syncDebounceMs?: number;
}
export interface FirestoreModuleConfig {
    firestorePath?: string;
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare const CreatePlugin: VueSyncPlugin<FirestorePluginOptions>;
