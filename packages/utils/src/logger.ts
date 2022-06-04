import { isFullArray, isNumber } from 'is-what'
// cannot directly import core because of cyclic workspace dependencies
// figure out how to share this type in the future
import { EventFnSuccess } from '../../core/src'

export const logger: EventFnSuccess = function ({
  payload,
  actionName,
  storeName,
  path,
  docId,
  pluginModuleConfig,
}) {
  if (storeName !== 'remote') return
  const { where, orderBy, limit } = pluginModuleConfig
  const docOrCollection = docId ? `doc('${path}')` : `collection('${path}')`

  const cleanClause = (c: any) => JSON.stringify(c).replaceAll(`"`, `'`)
  const _where = !isFullArray(where)
    ? []
    : where.map((whereClause) => `where(${whereClause.map(cleanClause).join(', ')})`)
  const _orderBy = !isFullArray(orderBy)
    ? []
    : orderBy.map((o) => `orderBy(${o.map(cleanClause).join(', ')})`)
  const _limit = !isNumber(limit) ? [] : [`limit(${limit})`]
  const message = ['db', docOrCollection, ..._where, ..._orderBy, ..._limit].join('.')
  const action = payload === undefined ? [`${actionName}()`] : [`${actionName}(`, payload, `)`]
  console.info(
    `%c💫 ${message}`,
    'background: #0e0f15; color: #af98e6; border-radius: 4px; padding: 6px 10px;',
    ...action
  )
}
