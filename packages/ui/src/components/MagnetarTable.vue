<script setup lang="ts">
import { CollectionInstance, WhereClauseTuple, WhereFilterOp } from '@magnetarjs/types'
import { isAnyObject, isError, isPlainObject } from 'is-what'
import { computed, onMounted, ref } from 'vue'
import {
  FilterState,
  MUIColumn,
  MUIFilter,
  MUILabel,
  muiLabelDic,
  MUIPagination,
  MUIParseLabel,
  OPaths,
  OrderByState,
} from '../types'
import {
  calcCollection,
  columnsToInitialOrderByState,
  filterStateToClauses,
  filtersToInitialState,
  orderByStateToClauses,
} from '../utils'
import LoadingSpinner from './LoadingSpinner.vue'
import TableFilter from './TableFilter.vue'
import TableTd from './TableTd.vue'
import TableTh from './TableTh.vue'

const props = defineProps<{
  collection: CollectionInstance<any>
  columns: MUIColumn<any>[]
  pagination: MUIPagination
  filters: MUIFilter<any, any, any>[]
  parseLabel?: MUIParseLabel
}>()

function muiLabel(label: MUILabel): string {
  return props.parseLabel ? props.parseLabel(label) || muiLabelDic[label] : muiLabelDic[label]
}

// const emit = defineEmits<{}>()
const fetchState = ref<'ok' | 'fetching' | { error: string }>('ok')

const filterState = ref<FilterState>(filtersToInitialState(props.filters))
const orderByState = ref<OrderByState>(columnsToInitialOrderByState(props.columns))

const currentFilters = computed(() => filterStateToClauses(filterState.value))
const currentOrderBy = computed(() => orderByStateToClauses(orderByState.value))

function resetState(resetFetchState?: boolean): void {
  filterState.value = filtersToInitialState(props.filters)
  orderByState.value = columnsToInitialOrderByState(props.columns)
  collectionInstance.value = calcCollection(props.collection, filterState.value, orderByState.value)
  if (resetFetchState) fetchState.value = 'ok'
}

/** This instance is not computed so that we can delay setting it after fetching the relevant records */
const collectionInstance = ref(
  calcCollection(props.collection, filterState.value, orderByState.value)
)

async function fetchMore() {
  fetchState.value = 'fetching'
  const collection = calcCollection(props.collection, filterState.value, orderByState.value)

  try {
    await collection
      .limit(props.pagination.limit)
      .startAfter(collection.fetched.cursor)
      .fetch({ force: true })
    await collection.fetchCount()
    if (collection.fetched.reachedEnd) console.log(`that's all!`)
    fetchState.value = 'ok'
    collectionInstance.value = collection
  } catch (error: unknown) {
    console.error(`fetchMore error:`, error)
    if ((isError(error) || isAnyObject(error)) && 'message' in error) {
      fetchState.value = { error: error.message }
    } else {
      fetchState.value = { error: muiLabel('magnetar table fetch-state error default') }
    }
  }
}

onMounted(() => {
  props.collection.fetchCount()
  fetchMore()
})

const rows = computed(() => {
  const collection = collectionInstance.value
  return [...collection.data.values()]
})

async function setFilter(where: WhereClauseTuple<any, any, any>, to: boolean): Promise<void> {
  filterState.value.set(where, to)

  const op: WhereFilterOp = where[1]
  /**
   * Optionally an `orderBy` might need to be set for a certain where filter
   *
   * An example error from firestore:
   * > Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field 'title' and so you must also use 'title' as your first argument to orderBy(), but your first orderBy() is on field 'isDone' instead.
   */
  const setOrderBy =
    op === '!=' || op === '<' || op === '<=' || op === '>' || op === '>=' || op === 'not-in'
  if (setOrderBy) {
    const fieldPath = where[0]
    const direction = 'asc'
    // must be inserted at position 0
    orderByState.value = new Map([[fieldPath, direction], ...orderByState.value.entries()])
  }

  // it looks better UI wise to delay the actual fetch to prevent UI components from freezing
  await new Promise((resolve) => setTimeout(resolve, 200))
  await fetchMore()
}

async function setOrderBy(
  fieldPath: OPaths<any>,
  direction: 'asc' | 'desc' | undefined
): Promise<void> {
  if (!direction) orderByState.value.delete(fieldPath)
  if (direction) orderByState.value.set(fieldPath, direction)
  // it looks better UI wise to delay the actual fetch to prevent UI components from freezing
  await new Promise((resolve) => setTimeout(resolve, 200))
  await fetchMore()
}
</script>

<template>
  <div class="magnetar-table">
    <section class="magnetar-table-info">
      <table>
        <thead>
          <tr>
            <td>{{ muiLabel('magnetar table info counts total') }}</td>
            <td>{{ muiLabel('magnetar table info counts filter') }}</td>
            <td>{{ muiLabel('magnetar table info counts showing') }}</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ collection.count }}</td>
            <td>{{ collectionInstance.count }}</td>
            <td>{{ rows.length }}</td>
          </tr>
        </tbody>
      </table>

      <LoadingSpinner v-if="fetchState === 'fetching'" class="magnetar-fetch-state-loading" />

      <div v-if="isPlainObject(fetchState)" class="magnetar-fetch-state-error">
        <div><span>⚠️</span> {{ fetchState.error }}</div>
        <button @click="() => resetState(true)">
          {{ muiLabel('magnetar table fetch-state reset') }}
        </button>
      </div>
    </section>

    <section class="magnetar-table-filters">
      <TableFilter
        v-for="filter in filters"
        :filter="filter"
        :filterState="filterState"
        :collection="collection"
        :parseLabel="parseLabel"
        @setFilter="([where, to]) => setFilter(where, to)"
      />
      <div v-if="currentFilters.length || currentOrderBy.length" class="magnetar-current-state">
        <h6>{{ muiLabel('magnetar table active filters') }}</h6>
        <div>
          <div v-for="_filter in currentFilters" :key="JSON.stringify(_filter)">
            <!-- TODO: @click="() => filterState.delete(_filter)" -->
            .where({{ _filter.map((f) => JSON.stringify(f)).join(', ') }})
          </div>
          <div v-for="_orderBy in currentOrderBy" :key="JSON.stringify(_orderBy)">
            <!-- TODO: @click="() => orderByState.delete(_orderBy[0])" -->
            .orderBy({{ _orderBy.map((o) => JSON.stringify(o)).join(', ') }})
          </div>
        </div>
        <button @click="() => resetState()">
          {{ muiLabel('magnetar table clear filters button') }}
        </button>
      </div>
    </section>

    <table>
      <thead>
        <tr>
          <TableTh
            v-for="(column, i) in columns"
            :key="column.fieldPath + 'th' + i"
            :column="column"
            :orderByState="orderByState"
            :parseLabel="parseLabel"
            @setOrderBy="([fieldPath, direction]) => setOrderBy(fieldPath, direction)"
          />
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <template
            v-for="(column, columnIndex) in columns"
            :key="column.fieldPath + 'td' + row.id"
          >
            <slot :name="`cell-${column.fieldPath || `${columnIndex}`}`">
              <TableTd :row="row" :column="column" :parseLabel="parseLabel" />
            </slot>
          </template>
        </tr>
        <slot v-if="!rows.length" name="empty">
          <div>
            <p class="text-center">{{ muiLabel('magnetar table no-results') }}</p>
          </div>
        </slot>
      </tbody>
    </table>

    <section class="magnetar-table-controls">
      <button @click="() => fetchMore()">
        {{ muiLabel('magnetar table fetch-more button') }}
      </button>
    </section>
  </div>
</template>

<style lang="sass" scoped>
.magnetar-table
  display: flex
  flex-direction: column
  gap: 1rem
.magnetar-table-info
  display: flex
  flex-wrap: wrap
  gap: 1rem
  align-items: center
  min-height: 26px
  h6
    margin: 0
.magnetar-fetch-state-error
  display: flex
  flex-direction: column
  gap: 0.5rem
  white-space: pre-line
  word-break: break-word
.magnetar-current-state
  display: flex
  flex-direction: column
  align-items: flex-start
  gap: 0.5rem
  > h6
    margin: 0
  > div
    display: flex
    flex-wrap: wrap
    gap: .5rem
    align-items: center
    > *
      background: var(--c-primary-extra-light, whitesmoke)
      border-radius: 0.25rem
      padding: 0.25rem 0.5rem
.magnetar-table-filters
  display: flex
  flex-wrap: wrap
  gap: 1rem
</style>
