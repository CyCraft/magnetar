import type { EventFnSuccess, QueryClause, WhereClause } from '@magnetarjs/types'
import { isArray, isFullArray, isNumber } from 'is-what'

/**
 * Logs to the console with `console.info` and colors.
 */
export function logWithFlair(message: string, ...args: any[]): void {
  console.info(
    `%c💫 [magnetar] ${message}`,
    'background: #0e0f15; color: #af98e6; border-radius: 4px; padding: 6px 10px;',
    ...args
  )
}

function stringifyQueryClause(q: QueryClause): string {
  return 'or' in q
    ? `or(${q.or
        .map((clause) =>
          isArray(clause) ? stringifyWhereClause(clause) : stringifyQueryClause(clause)
        )
        .join(', ')})`
    : `and(${q.and
        .map((clause) =>
          isArray(clause) ? stringifyWhereClause(clause) : stringifyQueryClause(clause)
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
