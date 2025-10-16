import type { EventFnSuccess, QueryClause, WhereClause } from '@magnetarjs/types'
import { isAnyObject, isArray, isFullArray, isNumber } from 'is-what'

/**
 * `Line-height: 2` is to prevent line overlapping on Safari
 */
const LOGGER_STYLE =
  'background: #0e0f15; color: #af98e6; border-radius: 4px; padding: 6px 10px; line-height: 2;'

const LOGGER_STYLE_ERROR =
  'background: #b91c1c; color: #ffffff; border-radius: 4px; padding: 6px 10px; line-height: 2;'

/**
 * Logs to the console with `console.info` and colors.
 */
export function logWithFlair(message: string, ...args: any[]): undefined {
  const isError = args.some((a) => isAnyObject(a) && !!a?.['error'])
  if (isError) {
    console.error(`%c💫 [magnetar] ${message}`, LOGGER_STYLE_ERROR, ...args)
  } else {
    console.info(`%c💫 [magnetar] ${message}`, LOGGER_STYLE, ...args)
  }
}

let lastGroupLogTime = 0
let lastGroupParams: unknown = null

function shouldLog(params: any, preventLogFor: number) {
  const now = Date.now()
  // Check if the last log was less than 60000 milliseconds (1 minute) ago
  // and if the parameters are the same as the last call
  if (
    now - lastGroupLogTime < preventLogFor &&
    JSON.stringify(params) === JSON.stringify(lastGroupParams)
  ) {
    return false
  }
  lastGroupLogTime = now
  lastGroupParams = params
  return true
}

/**
 * Logs to the console with `console.groupCollapsed` and colors.
 */
export function logWithFlairGroup(
  title: string,
  nestedMessage: string,
  options?: { preventLogFor: number },
): undefined {
  if (options && !shouldLog([title, nestedMessage], options.preventLogFor)) return

  console.groupCollapsed(`%c💫 [magnetar] ${title}`, LOGGER_STYLE)
  console.log(nestedMessage)
  console.groupEnd()
}

function stringifyQueryClause(q: QueryClause): string {
  return 'or' in q
    ? `or(${q.or
        .map((clause) =>
          isArray(clause) ? stringifyWhereClause(clause) : stringifyQueryClause(clause),
        )
        .join(', ')})`
    : `and(${q.and
        .map((clause) =>
          isArray(clause) ? stringifyWhereClause(clause) : stringifyQueryClause(clause),
        )
        .join(', ')})`
}

function clean(c: any): string {
  return JSON.stringify(c).replaceAll(`"`, `'`)
}

function stringifyWhereClause(w: WhereClause): string {
  return `where(${w.map(clean).join(', ')})`
}

export const logger: EventFnSuccess = function ({
  payload,
  actionName,
  storeName,
  path,
  docId,
  pluginModuleConfig,
}) {
  if (storeName !== 'remote') return
  const { query, where, orderBy, limit } = pluginModuleConfig
  const docOrCollection = docId ? `doc('${path}')` : `collection('${path}')`

  const _query = !isFullArray(query)
    ? []
    : query.map((queryClause) => `where(${stringifyQueryClause(queryClause)}`)
  const _where = !isFullArray(where)
    ? []
    : where.map((whereClause) => stringifyWhereClause(whereClause))
  const _orderBy = !isFullArray(orderBy)
    ? []
    : orderBy.map((o) => `orderBy(${o.map(clean).join(', ')})`)
  const _limit = !isNumber(limit) ? [] : [`limit(${limit})`]
  const message = ['db', docOrCollection, ..._query, ..._where, ..._orderBy, ..._limit].join('.')
  const action = payload === undefined ? [`${actionName}()`] : [`${actionName}(`, payload, `)`]
  logWithFlair(message, ...action)
}
