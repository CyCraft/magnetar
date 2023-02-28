import { ModuleConfig } from './config'

export const MODULE_IDENTIFIER_SPLIT = ' /// '

/**
 * Saved as enum, just to enforce usage of `getPathFilterIdentifier()`
 */
export enum PathFilterIdentifier {
  'KEY' = 'modulePath + JSON.stringify({ where, orderBy, startAfter, limit })',
}

/**
 * Creates the `key` for the Maps used to cache certain values throughout the lifecycle of an instance.
 * @returns `modulePath + ' /// ' + JSON.stringify({ where, orderBy, startAfter, limit })`
 */
export function getPathFilterIdentifier(
  modulePath: string,
  moduleConfig: ModuleConfig
): PathFilterIdentifier {
  const { where, orderBy, startAfter, limit } = moduleConfig
  const config = JSON.stringify({ where, orderBy, startAfter, limit })

  return `${modulePath}${MODULE_IDENTIFIER_SPLIT}${config}` as unknown as PathFilterIdentifier.KEY
}

/**
 * Saved as enum, just to enforce usage of `getPathWhereOrderByIdentifier()`
 */
export enum PathWhereOrderByIdentifier {
  'KEY' = 'modulePath + JSON.stringify({ where, orderBy })',
}

/**
 * Creates the `key` for the Maps used to cache the FetchMetaDataCollection throughout the lifecycle of an instance.
 * @returns `modulePath + ' /// ' + JSON.stringify({ where, orderBy })`
 */
export function getPathWhereOrderByIdentifier(
  modulePath: string,
  moduleConfig: ModuleConfig
): PathWhereOrderByIdentifier {
  const { where, orderBy } = moduleConfig
  const config = JSON.stringify({ where, orderBy })

  return `${modulePath}${MODULE_IDENTIFIER_SPLIT}${config}` as unknown as PathWhereOrderByIdentifier.KEY
}

/**
 * Saved as enum, just to enforce usage of `getPathWhereIdentifier()`
 */
export enum PathWhereIdentifier {
  'KEY' = 'modulePath + JSON.stringify({ where, orderBy })',
}

/**
 * Creates the `key` for the Maps used to cache the FetchMetaDataCollection throughout the lifecycle of an instance.
 * @returns `modulePath + ' /// ' + JSON.stringify({ where, orderBy })`
 */
export function getPathWhereIdentifier(
  modulePath: string,
  moduleConfig: ModuleConfig
): PathWhereIdentifier {
  const { where, orderBy } = moduleConfig
  const config = JSON.stringify({ where, orderBy })

  return `${modulePath}${MODULE_IDENTIFIER_SPLIT}${config}` as unknown as PathWhereIdentifier.KEY
}
