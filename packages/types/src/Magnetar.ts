import { O } from 'ts-toolbelt'
import { CollectionInstance } from './Collection'
import { GlobalConfig, ModuleConfig } from './types/config'
import { DocInstance } from './Doc'

/**
 * This is the global Magnetar instance that is returned when instantiating with Magnetar()
 */
export interface MagnetarInstance {
  globalConfig: O.Compulsory<GlobalConfig>
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
   */
  clearAllData: () => Promise<void>
  /**
   * Close all streams of the entire Magnetar instance
   */
  closeAllStreams: () => Promise<void>
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
export type CollectionFn<
  DocDataTypeInherited extends Record<string, any> = Record<string, any>,
  GranularTypesInherited extends { insert: Record<string, any> } = { insert: DocDataTypeInherited }
> = <
  DocDataType extends Record<string, any> = DocDataTypeInherited,
  GranularTypes extends { insert: Record<string, any> } = GranularTypesInherited
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => CollectionInstance<DocDataType, GranularTypes>

/**
 * This is the `doc()` method type.
 * @see {@link DocInstance}
 */
export type DocFn<
  DocDataTypeInherited extends Record<string, any> = Record<string, any>,
  GranularTypesInherited extends { insert: Record<string, any> } = { insert: DocDataTypeInherited }
> = <
  DocDataType extends Record<string, any> = DocDataTypeInherited,
  GranularTypes extends { insert: Record<string, any> } = GranularTypesInherited
>(
  idOrPath: string,
  moduleConfig?: ModuleConfig
) => DocInstance<DocDataType, GranularTypes>
