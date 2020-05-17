import { O } from 'ts-toolbelt'
import { SharedConfig } from './config'
import { PlainObject, StoreName } from './atoms'
import { DocInstance } from '../Doc'
import { CollectionInstance } from '../Collection'

/**
 * these are all the actions that Vue Sync streamlines, whichever plugin is used
 * these actions are executable from a `VueSyncModule` and handled by each plugin individually
 */
export type ActionName = 'get' | 'stream' | 'insert' | 'merge' | 'assign' | 'replace' | 'deleteProp' | 'delete' // prettier-ignore

/**
 * You can pass options to this action specifically;
 * This is what the dev can provide as second param when executing any action in addition to the payload.
 * @example
 * // first update the server and await that before updating the local store:
 * { executionOrder: ['remote', 'local'] }
 * @example
 * // don't throw errors for this action, wherever it might fail
 * { onError: 'continue' }
 */
export type ActionConfig = O.Merge<
  { executionOrder?: StoreName[] },
  Partial<O.Omit<SharedConfig, 'dataStoreName' | 'executionOrder'>>
>

// these are the action types exposed to the dev via a VueSyncModule, it's what the dev will end up calling.

export type VueSyncStreamAction = (
  payload?: object | void,
  actionConfig?: ActionConfig
) => Promise<void>

export type VueSyncGetAction<
  DocDataType extends object = PlainObject,
  calledFrom extends 'collection' | 'doc' = 'collection' | 'doc'
> = (
  payload?: object | void,
  actionConfig?: ActionConfig
) => Promise<
  calledFrom extends 'collection' ? CollectionInstance<DocDataType> : DocInstance<DocDataType>
>

export type VueSyncInsertAction<DocDataType extends object = PlainObject> = (
  payload: DocDataType,
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

export type VueSyncWriteAction<DocDataType extends object = PlainObject> = (
  payload: O.Optional<DocDataType, keyof DocDataType, 'deep'>,
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

export type VueSyncDeletePropAction<DocDataType extends object = PlainObject> = (
  payload: keyof DocDataType | string | (keyof DocDataType | string)[],
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

/**
 * @param {*} [payload] The delete action doesn't need any payload. In some cases, a Store Plugin you use might accept a payload.
 * @param {ActionConfig} [actionConfig]
 * @example
 * // first update the server and await that before updating the local store:
 * doc(id).delete(undefined, { executionOrder: ['remote', 'local'] })
 */
export type VueSyncDeleteAction<DocDataType extends object = PlainObject> = (
  payload?: any,
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

/**
 * A WeakMap of all open streams with the payload passed to `stream(payload)` as key and the `unsubscribe` function as value. In case `stream()` had no payload, use `{}`
 * @example
 * collection('myDocs').stream()
 * const unsubscribe = collection('myDocs').openStreams.get({})
 */
export type OpenStreams = Map<object, () => void>
