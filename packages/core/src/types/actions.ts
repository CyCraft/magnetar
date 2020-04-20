import { O } from 'ts-toolbelt'
import { isAnyObject } from 'is-what'
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
 * this is what the dev can provide as second param when executing any action in addition to the payload
 */
export type ActionConfig = O.Merge<
  { executionOrder?: StoreName[] },
  Partial<O.Omit<SharedConfig, 'dataStoreName'>>
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
  payload: keyof DocDataType | (keyof DocDataType)[],
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

export type VueSyncDeleteAction<DocDataType extends object = PlainObject> = (
  actionConfig?: ActionConfig
) => Promise<DocInstance<DocDataType>>

export type VueSyncError = {
  payload: PlainObject | PlainObject[] | string | string[] | void
  message: string
  code?: number
  errors?: VueSyncError[]
}

export function isVueSyncError (payload: any): payload is VueSyncError {
  return isAnyObject(payload) && 'payload' in payload && 'message' in payload
}
