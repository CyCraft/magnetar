import type Client from 'firebase/firestore'
import type Admin from 'firebase-admin/firestore'
import type { WhereClause, OrderByClause, Limit, SyncBatch } from '@magnetarjs/types'

export type Firestore = Client.Firestore | Admin.Firestore
export type DocumentSnapshot<T> = Client.DocumentSnapshot<T> | Admin.DocumentSnapshot<T>
export type WriteBatch = Client.WriteBatch | Admin.WriteBatch

export type CreateWriteBatch =
  | ((db: Client.Firestore) => Client.WriteBatch)
  | ((db: Admin.Firestore) => Admin.WriteBatch)
export type ApplySyncBatch =
  | ((writeBatch: Client.WriteBatch, batch: SyncBatch, db: Client.Firestore) => void)
  | ((writeBatch: Admin.WriteBatch, batch: SyncBatch, db: Admin.Firestore) => void)

// there are two interfaces to be defined & exported by each plugin: `StoreOptions` and `StoreModuleConfig`
// for `plugin-firestore` and `plugin-firebase-admin` we use:
// - FirestorePluginOptions
// - FirestoreModuleConfig

export type FirestorePluginOptions<Firestore extends Client.Firestore | Admin.Firestore> = {
  /**
   * It's required to pass the Firestore instance to make sure there are not two separate instances running which can cause issues.
   * As long as Firebase is initialized before you pass it, you can just import and pass it like so:
   * @example This example is for client side applications (scroll down for firebase-admin example)
   * ```js
   * import { initializeApp } from 'firebase/app'
   * import { getFirestore } from 'firebase/firestore'
   * import { CreatePlugin as FirestorePlugin } from '@magnetarjs/firestore'
   *
   * const firebaseApp = initializeApp({  }) // pass config
   * const db = getFirestore(firebaseApp)
   *
   * // initialise plugin
   * const remote = FirestorePlugin({ db })
   *
   * // add to magnetar during initialisation
   * const magnetar = Magnetar({
   *   localStoreName: 'local',
   *   stores: { local, remote },
   *   // ...
   * }
   * ```
   *
   * @example This example is for server side applications (scroll up for firestore client SDK example)
   * ```js
   * import { initializeApp } from 'firebase-admin/app'
   * import { getFirestore } from 'firebase-admin/firestore'
   * import { CreatePlugin as FirestoreAdminPlugin } from '@magnetarjs/firestore-admin'
   *
   * const firebaseApp = initializeApp()
   * const db = getFirestore(firebaseApp)
   *
   * // initialise plugin
   * const remote = FirestoreAdminPlugin({ db })
   *
   * // add to magnetar during initialisation
   * const magnetar = Magnetar({
   *   localStoreName: 'local',
   *   stores: { local, remote },
   *   // ...
   * }
   * ```
   */
  db: Firestore
  /**
   * When this is true, the "modulePath" will be used as firestorePath to sync the data to. Eg. `collection('todos')` will sync data to `todos` on firestore. When this is false (default) the firestorePath must be provided like so: `collection('todos', { firestorePath: 'myTodos' })`
   */
  useModulePathsForFirestore?: boolean
  /**
   * Defaults to 1000ms. The amount of milliseconds before an action is synced to Firestore. Every time a consecutive action is triggered the debounce will reset.
   */
  syncDebounceMs?: number
  /**
   * Logs extra information in the developer console every time it interacts with the server.
   *
   * Be sure to disable this on production!
   */
  debug?: boolean
}

export type FirestoreModuleConfig = {
  firestorePath?: string
  where?: WhereClause[]
  orderBy?: OrderByClause[]
  limit?: Limit
  syncDebounceMs?: number
  startAfter?: unknown[] | DocumentSnapshot<unknown>
}
