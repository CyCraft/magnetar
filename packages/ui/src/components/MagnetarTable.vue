<script setup lang="ts">
import { logWithFlair } from '@magnetarjs/utils'
import type { CollectionInstance } from '@magnetarjs/types'
import { useElementSize } from '@vueuse/core'
import { isAnyObject, isError, isPlainObject, isNumber } from 'is-what'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  MUIRowMeta,
  FilterState,
  FiltersState,
  MUIColumn,
  MUIFilter,
  MUILabel,
  MUIPagination,
  MUIParseLabel,
  OPaths,
  OrderByState,
  muiLabelDic,
} from '../types'
import {
  calcCollection,
  carbonCopyMap,
  filtersAndColumnsToInitialState,
  getRequiredOrderByBasedOnFilters,
  mapUnshift,
} from '../utils/tableHelpers'
import TableDataInfo from './TableDataInfo.vue'
import TableFilter from './TableFilter.vue'
import TablePagination from './TablePagination.vue'
import TableTh from './TableTh.vue'
import TableTr from './TableTr.vue'
import TextWithAnchorTags from './TextWithAnchorTags.vue'
import MagnetarFiltersCodeRepresentation from './MagnetarFiltersCodeRepresentation.vue'

const props = defineProps<{
  collection: CollectionInstance<any>
  columns: MUIColumn<any, any>[]
  rowMeta?: MUIRowMeta
  pagination: MUIPagination
  filters?: MUIFilter<any, any>[]
  parseLabel?: MUIParseLabel
  /**
   * - Only use this in advanced cases. You should set up initial filter state via `filters` instead.
   * - Passing this will apply those filters on top of the filter state that will be derived based on the `filters` prop
   */
  filtersState?: FiltersState
  /**
   * - Only use this in advanced cases. You should set up initial orderBy state via `columns` instead.
   * - Passing this will replace any orderBy state that is derived based on the `columns` prop
   */
  orderByState?: OrderByState
  /**
   * A browser-side data filter that is applied on the fetched data locally.
   */
  filterDataFn?: (record: Record<string, unknown>, index: number) => boolean
}>()

const emit = defineEmits<{
  (e: 'update:filtersState', payload: FiltersState): void
  (e: 'update:orderByState', payload: OrderByState): void
}>()

function muiLabel(label: MUILabel): string {
  return props.parseLabel ? props.parseLabel(label) ?? muiLabelDic[label] : muiLabelDic[label]
}

// const emit = defineEmits<{}>()
const fetchState = ref<'ok' | 'end' | 'fetching' | { error: string }>('ok')

const initialState = ((): {
  filtersState: FiltersState
  orderByState: OrderByState
} => {
  const { filtersState, orderByState } = filtersAndColumnsToInitialState({
    columns: props.columns,
    filters: props.filters ?? [],
  })
  if (props.filtersState) {
    for (const [index, state] of props.filtersState) {
      filtersState.set(index, state)
    }
  }
  return {
    filtersState,
    orderByState: props.orderByState || orderByState,
  }
})()

const filtersState = ref<FiltersState>(carbonCopyMap(initialState.filtersState))
watch(filtersState, (payload) => emit('update:filtersState', payload), {
  deep: true,
  immediate: true,
})
watch(
  () => props.filtersState,
  async (payload) => {
    if (!payload) return
    filtersState.value = payload
    await new Promise((resolve) => setTimeout(resolve, 200))
    await fetchMore()
  },
  { deep: true }
)
const orderByState = ref<OrderByState>(carbonCopyMap(initialState.orderByState))
watch(orderByState, (payload) => emit('update:orderByState', payload), { deep: true })
watch(
  () => props.orderByState,
  async (payload) => {
    if (!payload) return
    orderByState.value = payload
    await new Promise((resolve) => setTimeout(resolve, 200))
    await fetchMore()
  },
  { deep: true }
)

/**
 * This will always be true in case there was no initialState
 */
const initialStateActive = computed<boolean>(() => {
  const initialFilters = initialState.filtersState
  const initialOrderBy = initialState.orderByState
  if (!initialFilters.size && !initialOrderBy.size) {
    return true
  }
  return (
    filtersState.value.size === initialFilters.size &&
    orderByState.value.size === initialOrderBy.size &&
    [...filtersState.value.entries()].every(([key, value]) => initialFilters.get(key) === value) &&
    [...orderByState.value.entries()].every(([key, value]) => initialOrderBy.get(key) === value)
  )
})

const hasSomeFilterOrOrderby = computed<boolean>(
  () => !!filtersState.value.size || !!orderByState.value.size
)

/**
 * Do not confuse `activeCollection` with `collectionInstance`
 * - `collectionInstance` is a `ref`, **not** `computed` so that we can delay setting it after fetching the relevant records
 * - `activeCollection` is `computed` so that at all times you can access it from the parent via a `ref="magnetarTableInstance"`
 */
const collectionInstance = ref(
  calcCollection(props.collection, filtersState.value, orderByState.value, props.filters ?? [])
)

/**
 * Do not confuse `activeCollection` with `collectionInstance`
 * - `collectionInstance` is a `ref`, **not** `computed` so that we can delay setting it after fetching the relevant records
 * - `activeCollection` is `computed` so that at all times you can access it from the parent via a `ref="magnetarTableInstance"`
 */
const activeCollection = computed<CollectionInstance<any>>(() =>
  calcCollection(props.collection, filtersState.value, orderByState.value, props.filters ?? [])
)

function clearAllRecords(): undefined {
  props.collection.data.clear()
  collectionInstance.value.fetched.cursor = undefined
  pageIndex.value = 0
}

function resetState(): undefined {
  filtersState.value = carbonCopyMap(initialState.filtersState)
  orderByState.value = carbonCopyMap(initialState.orderByState)
  clearAllRecords()
  fetchMore()
}

function clearState(): undefined {
  filtersState.value = new Map()
  orderByState.value = new Map()
  clearAllRecords()
  fetchMore()
}

/** If we have a page size that is not 0 or Infinity, we return it, otherwise `false` */
const pageSize = computed<false | number>(() => {
  const { pageSize } = props.pagination
  return isNumber(pageSize) && pageSize > 0 && pageSize !== Infinity ? pageSize : false
})

const minH = ref(26)
const minW = ref(26)
const tableEl = ref(null)
const { height, width } = useElementSize(tableEl)
/**
 * set the min-width and -height once after the first page was fetched
 * only set it once to prevent the table from growing more when expanding rows etc.
 */
async function setMinTableHeight() {
  await nextTick()
  if (pageSize.value === false || collectionInstance.value.data.size >= pageSize.value) {
    if (minH.value === 26 && height.value > 26) minH.value = height.value
    if (minW.value === 26 && width.value > 26) minW.value = width.value
  }
}

/** never throws */
async function fetchMore(params: { limit: number } = { limit: props.pagination.fetchSize }) {
  fetchState.value = 'fetching'

  const fetchSize = params.limit
  const limit: number | undefined =
    isNumber(fetchSize) && fetchSize > 0 && fetchSize !== Infinity ? fetchSize : undefined

  const filteredCollection = activeCollection.value
  const collectionToFetch = limit
    ? filteredCollection.startAfter(filteredCollection.fetched.cursor).limit(limit)
    : filteredCollection
  try {
    await collectionToFetch.fetch({ force: true })
    await collectionInstance.value.fetchCount()
    fetchState.value = collectionToFetch.fetched.reachedEnd ? 'end' : 'ok'
    // set new state
    collectionInstance.value = filteredCollection

    setMinTableHeight()
  } catch (error: unknown) {
    console.error(`fetchMore error:`, error)
    if ((isError(error) || isAnyObject(error)) && 'message' in error) {
      fetchState.value = { error: `${error.message}` }
    } else {
      fetchState.value = { error: muiLabel('magnetar table fetch-state error default') }
    }
  }
}

function fetchAll() {
  fetchMore({ limit: 0 })
}

defineExpose({ activeCollection, fetchMore, fetchAll, fetchState })

onMounted(() => {
  clearAllRecords()
  props.collection.fetchCount()
  fetchMore()
})

async function setFilter(filterIndex: number, payload: null | FilterState): Promise<void> {
  clearAllRecords()
  const filterConfig = props.filters?.[filterIndex]
  if (filterConfig?.clearOtherFilters) {
    filtersState.value = new Map()
  }
  if (filterConfig?.clearOrderBy) {
    orderByState.value = new Map()
  }
  if (!payload) {
    filtersState.value.delete(filterIndex)
  } else {
    filtersState.value.set(filterIndex, payload)
    const newEntries = getRequiredOrderByBasedOnFilters(filtersState.value)
    if (newEntries.length) orderByState.value = mapUnshift(orderByState.value, ...newEntries)
  }

  // it looks better UI wise to delay the actual fetch to prevent UI components from freezing
  await new Promise((resolve) => setTimeout(resolve, 200))
  await fetchMore()
}

async function setOrderBy(
  fieldPath: OPaths<any>,
  direction: 'asc' | 'desc' | null,
  clearOtherOrderBy?: boolean
): Promise<void> {
  clearAllRecords()
  if (clearOtherOrderBy) {
    for (const key of orderByState.value.keys()) {
      if (key !== fieldPath) orderByState.value.delete(key)
    }
  }
  if (!direction) orderByState.value.delete(fieldPath)
  if (direction) {
    orderByState.value.set(fieldPath, direction)
    const newEntries = getRequiredOrderByBasedOnFilters(filtersState.value)
    if (newEntries.length) orderByState.value = mapUnshift(orderByState.value, ...newEntries)
  }
  // it looks better UI wise to delay the actual fetch to prevent UI components from freezing
  await new Promise((resolve) => setTimeout(resolve, 200))
  await fetchMore()
}

const showingFiltersCode = ref(false)

/** All data as per collection instance with potential `.where` clauses applied */
const rowsAll = computed(() => [...collectionInstance.value.data.values()])
/** `rowsAll` but with extra local `filterDataFn` applied  */
const rowsFiltered = computed(() =>
  props.filterDataFn ? rowsAll.value.filter(props.filterDataFn) : rowsAll.value
)
/** `rowsFiltered` but with pagination applied  */
const rowsShown = computed(() => {
  if (pageSize.value === false) return rowsFiltered.value
  return rowsFiltered.value.slice(
    pageSize.value * pageIndex.value,
    pageSize.value * (pageIndex.value + 1)
  )
})

const pageIndex = ref(0)
const pageCountFetched = computed<number>(() => {
  if (!pageSize.value) return rowsAll.value.length ? 1 : 0
  if (props.filterDataFn) return Math.ceil(rowsFiltered.value.length / pageSize.value)
  return Math.ceil(rowsAll.value.length / pageSize.value)
})
const pageCountHypothetical = computed<number>(() => {
  if (!pageSize.value) return 1
  if (props.filterDataFn) return Math.ceil(rowsFiltered.value.length / pageSize.value)
  return Math.ceil(collectionInstance.value.count / pageSize.value)
})

// reset the page index when the total page count changes
watch(pageCountHypothetical, (newPageCount, oldPageCount) => {
  if (newPageCount !== oldPageCount) { pageIndex.value = 0 } // prettier-ignore
})

// fetch more when pageIndex changes
watch(pageIndex, async (newIndex) => {
  if (props.filterDataFn) {
    logWithFlair('[ui] fetching disabled when a `filterDataFn` in the props is present')
    return
  }
  if (fetchState.value === 'ok' && newIndex === pageCountFetched.value) {
    await fetchMore()
    await nextTick()
    if (!rowsShown.value.length) {
      // the final page fetched was empty, let's go back one page
      pageIndex.value = newIndex - 1
    }
  }
})

// prettier-ignore
const labelsFiltersCodeRepresentation = computed(() => ({
    'magnetar table no active filters': muiLabel('magnetar table no active filters'),
  }))

// prettier-ignore
const labelsDataInfo = computed(() => ({
    'magnetar table record counts': muiLabel('magnetar table record counts'),
    'magnetar table info counts total': muiLabel('magnetar table info counts total'),
    'magnetar table info counts filtered': muiLabel('magnetar table info counts filtered'),
    'magnetar table info counts fetched': muiLabel('magnetar table info counts fetched'),
    'magnetar table info counts showing': muiLabel('magnetar table info counts showing'),
  }))

// prettier-ignore
const labelsPagination = computed(() => ({
  'magnetar table fetch-more button end': muiLabel('magnetar table fetch-more button end'),
  'magnetar table fetch-more button': muiLabel('magnetar table fetch-more button'),
  'magnetar table previous-next first-page button': muiLabel('magnetar table previous-next first-page button'),
  'magnetar table previous-next last-page button': muiLabel('magnetar table previous-next last-page button'),
  'magnetar table previous-next previous button': muiLabel('magnetar table previous-next previous button'),
  'magnetar table previous-next next button': muiLabel('magnetar table previous-next next button'),
  'magnetar table previous-next end': muiLabel('magnetar table previous-next end'),
}))

const debugMode = !!localStorage.getItem('DEBUG')
</script>

<template>
  <div class="magnetar-table magnetar-column magnetar-gap-md">
    <section v-if="filters?.length || debugMode" class="magnetar-column magnetar-gap-sm">
      <div class="magnetar-row magnetar-gap-sm">
        <h6>
          {{
            showingFiltersCode
              ? muiLabel('magnetar table active filters')
              : muiLabel('magnetar table filters')
          }}
        </h6>
        <input v-model="showingFiltersCode" type="checkbox" id="showingFiltersCode" />
        <label for="showingFiltersCode">{{ muiLabel('magnetar table show filters code') }}</label>
        <div
          v-if="hasSomeFilterOrOrderby || !initialStateActive"
          class="magnetar-ml-auto magnetar-row magnetar-gap-sm"
        >
          <button v-if="!initialStateActive" @click="() => resetState()">
            {{ muiLabel('magnetar table fetch-state reset') }}
          </button>
          <button v-if="hasSomeFilterOrOrderby" @click="() => clearState()">
            {{ muiLabel('magnetar table clear filters button') }}
          </button>
        </div>
      </div>

      <div v-if="!showingFiltersCode" class="magnetar-row magnetar-gap-sm">
        <TableFilter
          v-for="(filter, filterIndex) in filters"
          :filter="filter"
          :filterState="filtersState.get(filterIndex)"
          :collection="collection"
          :parseLabel="parseLabel"
          @setFilter="(payload) => setFilter(filterIndex, payload)"
        />
      </div>

      <MagnetarFiltersCodeRepresentation
        v-if="showingFiltersCode"
        :labels="labelsFiltersCodeRepresentation"
        :hasSomeFilterOrOrderby="hasSomeFilterOrOrderby"
        :filters="filters"
        :filtersState="filtersState"
        :orderByState="orderByState"
        @setFilter="({ filterIndex, payload }) => setFilter(filterIndex, payload)"
        @setOrderBy="
          ({ fieldPath, direction, clearOtherOrderBy }) =>
            setOrderBy(fieldPath, direction, clearOtherOrderBy)
        "
      />
    </section>

    <TextWithAnchorTags
      v-if="isPlainObject(fetchState)"
      class="magnetar-fetch-state-error"
      :text="fetchState.error"
    />

    <TableDataInfo
      :labels="labelsDataInfo"
      :fetchState="fetchState"
      :collection="collection"
      :collectionInstance="collectionInstance"
      :rows="rowsShown"
    />

    <table ref="tableEl" :style="`min-height: ${minH}px; min-width: ${minW}px`">
      <thead>
        <tr>
          <th v-for="(column, i) in columns" :key="column.fieldPath + 'th' + i">
            <TableTh
              :column="column"
              :orderByState="orderByState"
              :parseLabel="parseLabel"
              @setOrderBy="
                ([fieldPath, direction]) =>
                  setOrderBy(
                    fieldPath,
                    direction,
                    isPlainObject(column.sortable) ? column.sortable.clearOtherOrderBy : false
                  )
              "
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <slot v-if="!rowsShown.length && fetchState !== 'fetching'" name="empty">
          <tr>
            <td :colspan="columns.length">
              <div class="magnetar-row magnetar-justify-center" style="min-height: 100px">
                {{ muiLabel('magnetar table no-results') }}
              </div>
            </td>
          </tr>
        </slot>
        <TableTr
          v-for="row in rowsShown"
          :key="row.id"
          :row="row"
          :columns="columns"
          :parseLabel="parseLabel"
          :rowMeta="rowMeta"
        >
          <template
            v-for="(column, columnIndex) in columns"
            :key="(column.fieldPath || column.slot) + 'td' + row.id"
            #[column.slot??columnIndex]="ctx"
          >
            <slot :name="column.slot || columnIndex" v-bind="ctx" />
          </template>
          <template #expansion="ctx"><slot name="expansion" v-bind="ctx" /></template>
        </TableTr>
      </tbody>
    </table>

    <TablePagination
      v-model:pageIndex="pageIndex"
      :pageSize="pageSize"
      :pageCountFetched="pageCountFetched"
      :pageCountHypothetical="pageCountHypothetical"
      :fetchMore="fetchMore"
      :fetchState="fetchState"
      :labels="labelsPagination"
      class="magnetar-table-controls"
    />
  </div>
</template>

<style lang="sass" src="./styles.sass" />

<style lang="sass" scoped>
.magnetar-table
  h6
    margin: 0
.magnetar-fetch-state-error
  color: var(--c-error, indianred)
.magnetar-table-controls
  display: flex
  align-items: center
  gap: 0.5rem
</style>
