<script setup lang="ts">
import { CollectionInstance } from '@magnetarjs/types'
import { useElementSize } from '@vueuse/core'
import { isAnyObject, isArray, isError, isPlainObject } from 'is-what'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  FiltersState,
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
  carbonCopyMap,
  filtersAndColumnsToInitialState,
  filterStateToClauses,
  getRequiredOrderByBasedOnFilters,
  mapUnshift,
  orderByStateToClauses,
} from '../utils/tableHelpers'
import LoadingSpinner from './LoadingSpinner.vue'
import TableFilter from './TableFilter.vue'
import TablePagination from './TablePagination.vue'
import TableTh from './TableTh.vue'
import TableTr from './TableTr.vue'
import TextWithAnchorTags from './TextWithAnchorTags.vue'

const props = defineProps<{
  collection: CollectionInstance<any>
  columns: MUIColumn<any, any>[]
  pagination: MUIPagination
  filters: MUIFilter<any, any>[]
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
    filters: props.filters,
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
const orderByState = ref<OrderByState>(carbonCopyMap(initialState.orderByState))

const currentFilters = computed(() => filterStateToClauses(filtersState.value, props.filters))
const currentOrderBy = computed(() => orderByStateToClauses(orderByState.value))

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

/** This instance is not computed so that we can delay setting it after fetching the relevant records */
const collectionInstance = ref(
  calcCollection(props.collection, filtersState.value, orderByState.value, props.filters)
)

function clearAllRecords(): void {
  props.collection.data.clear()
  collectionInstance.value.fetched.cursor = undefined
}

function resetState(): void {
  filtersState.value = carbonCopyMap(initialState.filtersState)
  orderByState.value = carbonCopyMap(initialState.orderByState)
  clearAllRecords()
  fetchMore()
}

function clearState(): void {
  filtersState.value = new Map()
  orderByState.value = new Map()
  clearAllRecords()
  fetchMore()
}

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
  if (collectionInstance.value.data.size >= props.pagination.limit) {
    if (minH.value === 26 && height.value > 26) minH.value = height.value
    if (minW.value === 26 && width.value > 26) minW.value = width.value
  }
}

/** never throws */
async function fetchMore() {
  fetchState.value = 'fetching'
  const collection = calcCollection(
    props.collection,
    filtersState.value,
    orderByState.value,
    props.filters
  )

  try {
    await collection
      .limit(props.pagination.limit)
      .startAfter(collection.fetched.cursor)
      .fetch({ force: true })
    await collection.fetchCount()
    fetchState.value = collection.fetched.reachedEnd ? 'end' : 'ok'
    // set new state
    collectionInstance.value = collection

    setMinTableHeight()
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
  clearAllRecords()
  props.collection.fetchCount()
  fetchMore()
})

async function setFilter(filterIndex: number, payload: null | FilterState): Promise<void> {
  clearAllRecords()
  const filterConfig = props.filters[filterIndex]
  if (filterConfig.clearOtherFilters) {
    filtersState.value = new Map()
  }
  if (filterConfig.clearOrderBy) {
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

const pageIndex = ref(0)
const pageCountFetched = computed(() => Math.ceil(allData.value.length / props.pagination.limit))
const pageCount = computed(() => Math.ceil(collectionInstance.value.count / props.pagination.limit))

const allData = computed(() => [...collectionInstance.value.data.values()])
const rows = computed(() => {
  const { pagination } = props
  if (pagination.kind === 'previous-next') {
    return allData.value.slice(
      pagination.limit * pageIndex.value,
      pagination.limit * (pageIndex.value + 1)
    )
  }
  return allData.value
})

watch(pageIndex, async (newIndex) => {
  if (fetchState.value === 'ok' && newIndex === pageCountFetched.value) {
    await fetchMore()
    await nextTick()
    if (!rows.value.length) {
      // the final page fetched was empty, let's go back one page
      pageIndex.value = newIndex - 1
    }
  }
})

// prettier-ignore
const labelsPagination = computed(() => ({
  'magnetar table fetch-more button end': muiLabel('magnetar table fetch-more button end'),
  'magnetar table fetch-more button': muiLabel('magnetar table fetch-more button'),
  'magnetar table previous-next first-page button': muiLabel('magnetar table previous-next first-page button'),
  'magnetar table previous-next previous button': muiLabel('magnetar table previous-next previous button'),
  'magnetar table previous-next next button': muiLabel('magnetar table previous-next next button'),
  'magnetar table previous-next end': muiLabel('magnetar table previous-next end'),
}))
</script>

<template>
  <div class="magnetar-table magnetar-column magnetar-gap-md">
    <section
      v-if="filters.length || hasSomeFilterOrOrderby"
      class="magnetar-column magnetar-gap-sm"
    >
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

      <div v-if="showingFiltersCode" class="magnetar-row magnetar-gap-sm magnetar-active-filters">
        <div v-if="!hasSomeFilterOrOrderby">{{ muiLabel('magnetar table no active filters') }}</div>
        <div
          v-for="info in currentFilters"
          :key="JSON.stringify(filters)"
          class="magnetar-filter-code"
        >
          {{
            isArray(info.result)
              ? `.where(${info.result.map((chunk) => JSON.stringify(chunk)).join(', ')})`
              : `.query(${JSON.stringify(info.result)})`
          }}
          <button @click="() => setFilter(info.filterIndex, null)">✕</button>
        </div>
        <div
          v-for="_orderBy in currentOrderBy"
          :key="JSON.stringify(_orderBy)"
          class="magnetar-filter-code"
        >
          .orderBy({{ _orderBy.map((o) => JSON.stringify(o)).join(', ') }})
          <button @click="() => setOrderBy(_orderBy[0], null)">✕</button>
        </div>
      </div>
    </section>

    <TextWithAnchorTags
      v-if="isPlainObject(fetchState)"
      class="magnetar-fetch-state-error"
      :text="fetchState.error"
    />

    <section class="magnetar-column magnetar-gap-sm magnetar-items-end">
      <h6>{{ muiLabel('magnetar table record counts') }}</h6>
      <div class="magnetar-row magnetar-gap-md">
        <LoadingSpinner v-if="fetchState === 'fetching'" />
        {{ collection.count }} {{ muiLabel('magnetar table info counts total') }} /
        {{ collectionInstance.count }} {{ muiLabel('magnetar table info counts filtered') }} /
        {{ rows.length }} {{ muiLabel('magnetar table info counts showing') }}
      </div>
    </section>

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
        <slot v-if="!rows.length && fetchState !== 'fetching'" name="empty">
          <tr>
            <td :colspan="columns.length">
              <div class="magnetar-row magnetar-justify-center" style="min-height: 100px">
                {{ muiLabel('magnetar table no-results') }}
              </div>
            </td>
          </tr>
        </slot>
        <TableTr
          v-for="row in rows"
          :key="row.id"
          :row="row"
          :columns="columns"
          :parseLabel="parseLabel"
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
      :pageCount="pageCount"
      :kind="pagination.kind ?? 'fetch-more'"
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
.magnetar-table-info
  min-height: 26px
.magnetar-fetch-state-error
  color: var(--c-error, indianred)
.magnetar-filter-code
  background: var(--c-primary-extra-light, whitesmoke)
  border-radius: 0.25rem
  padding: 0.25rem 0.5rem
  display: flex
  align-items: center
  gap: 0.25rem
.magnetar-table-controls
  display: flex
  align-items: center
  gap: 0.5rem
</style>
