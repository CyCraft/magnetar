import { O } from 'ts-toolbelt'
import {
  MagnetarGetAction,
  MagnetarStreamAction,
  MagnetarInsertAction,
  OpenStreams,
} from './types/actions'
import { ModuleConfig, GlobalConfig } from './types/config'
import { DocFn, CollectionFn } from './Magnetar'
import { WhereFilterOp } from './types/clauses'
export declare type CollectionInstance<
  DocDataType extends Record<string, any> = Record<string, any>
> = {
  data: Map<string, DocDataType>
  doc: DocFn<DocDataType>
  id: string
  path: string
  /**
   * All open streams with the payload passed to `stream(payload)` as key and the `unsubscribe` function as value. In case `stream()` had no payload, use `{}`
   * @type { WeakMap<Record<string, any>, () => void> }
   * @example
   * collection('myDocs').stream()
   * const unsubscribe = collection('myDocs').openStreams.get({})
   */
  openStreams: OpenStreams
  get: MagnetarGetAction<DocDataType, 'collection'>
  stream: MagnetarStreamAction
  insert: MagnetarInsertAction<DocDataType>
  where: (fieldPath: string, operator: WhereFilterOp, value: any) => CollectionInstance<DocDataType>
  orderBy: (fieldPath: string, direction?: 'asc' | 'desc') => CollectionInstance<DocDataType>
  limit: (limitCount: number) => CollectionInstance<DocDataType>
}
export declare function createCollectionWithContext<DocDataType extends Record<string, any>>(
  [collectionPath, docId]: [string, string | undefined],
  moduleConfig: ModuleConfig,
  globalConfig: O.Compulsory<GlobalConfig>,
  docFn: DocFn<DocDataType>,
  collectionFn: CollectionFn<DocDataType>,
  openStreams: OpenStreams
): CollectionInstance<DocDataType>
