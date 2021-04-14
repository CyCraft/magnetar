import { MagnetarPlugin, WhereClause, OrderByClause, Limit } from '@magnetarjs/core';
export interface FirestorePluginOptions {
    /**
     * It's required to pass the firebase instance to make sure there are not two separate instances running which can cause issues.
     * As long as Firebase is initialized before you pass it, you can just import and pass it like so:
     * @example
     * ```js
     * import { CreatePlugin as FirestorePlugin } from '@magnetarjs/firestore'
     * import firebase from 'firebase/app'
     *
     * const remote = FirestorePlugin({ firebaseInstance: firebase })
     * ```
     */
    firebaseInstance: any;
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
export interface FirestoreModuleConfig {
    firestorePath?: string;
    where?: WhereClause[];
    orderBy?: OrderByClause[];
    limit?: Limit;
}
export declare const CreatePlugin: MagnetarPlugin<FirestorePluginOptions>;
