import { CollectionInstance } from './Collection.js'
import { DocInstance } from './Doc.js'
import { GlobalConfig, ModuleConfig } from './types/config.js'

/** Any of the possible collection paths used so far */
export type CollectionName = string

/**
 * This is the global Magnetar instance that is returned when instantiating with Magnetar()
 */
export type MagnetarInstance = {
  globalConfig: Required<GlobalConfig>
  /**
   * @see {@link CollectionFn}
   */
  collection: CollectionFn
  /**
   * @see {@link DocFn}
   */
  doc: DocFn
  /**
   * Clear all data of the entire Magnetar instance
   *
   * You can exclude any collection when clearing data
   * @example
   * ```ts
   * magnetar.clearAllData({ exclude: ['users'] })
   * ```
   */
  clearAllData: (
    /**
     * You can exclude any collection when clearing data
     * @example
     * ```ts
     * magnetar.clearAllData({ exclude: ['users'] })
     * ```
     */
    options?: { exclude?: CollectionName[] }
  ) => Promise<void>
  /**
   * Close all streams of the entire Magnetar instance
   *
   * You can exclude any collection when closing streams
   * @example
   * ```ts
   * magnetar.closeAllStreams({ exclude: ['users'] })
   * ```
   */
  closeAllStreams: (
    /**
     * You can exclude any collection when closing streams
     * @example
     * ```ts
     * magnetar.closeAllStreams({ exclude: ['users'] })
     * ```
     */
    options?: { exclude?: CollectionName[] }
  ) => Promise<void>
}

/**
 * The write lock promise that is resolved x seconds after the final write action has resolved
 */
export type WriteLock = {
  /** To be resolved after the countdown after the last write action finishes */
  promise: null | Promise<void>
  /** Resolves the `WriteLock['promise']` */
  resolve: () => any
  /** To be started after every write action & To be reset when a new write action occurs */
  countdown: null | ReturnType<typeof setTimeout>
}

/**
 * This is the `collection()` method type.
 * @see {@link CollectionInstance}
 */
export type CollectionFn = <
  DocDataType extends { [key: string]: any } = { [key: string]: any },
  GranularTypes extends { insert: { [key: string]: any } } = { insert: DocDataType },
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig<DocDataType>
) => CollectionInstance<DocDataType, GranularTypes>

/**
 * This is the `doc()` method type.
 * @see {@link DocInstance}
 */
export type DocFn<DocDataTypeInherited extends { [key: string]: any } = { [key: string]: any }> = <
  DocDataType extends { [key: string]: any } = DocDataTypeInherited,
  GranularTypes extends { insert: { [key: string]: any } } = { insert: DocDataType },
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig<DocDataType>
) => DocInstance<DocDataType, GranularTypes>
