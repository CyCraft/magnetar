<script setup lang="ts">
import { CollectionInstance, WhereFilterOp } from '@magnetarjs/types'
import { isAnyObject, isArray, isError, isPlainObject, isString } from 'is-what'
import { computed, onMounted, ref } from 'vue'
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
  columnsToInitialOrderByState,
  filterStateToClauses,
  filtersToInitialState,
  orderByStateToClauses,
} from '../utils'
import LoadingSpinner from './LoadingSpinner.vue'
import TableFilter from './TableFilter.vue'
import TableTd from './TableTd.vue'
import TableTh from './TableTh.vue'
import TextWithAnchorTags from './TextWithAnchorTags.vue'

const props = defineProps<{
  collection: CollectionInstance<any>
  columns: MUIColumn<any, any>[]
  pagination: MUIPagination
  filters: MUIFilter<any, any>[]
  parseLabel?: MUIParseLabel
  filtersState?: FiltersState
}>()

function muiLabel(label: MUILabel): string {
  return props.parseLabel ? props.parseLabel(label) || muiLabelDic[label] : muiLabelDic[label]
}

// const emit = defineEmits<{}>()
const fetchState = ref<'ok' | 'end' | 'fetching' | { error: string }>('ok')

const initialFilterState: FiltersState = (() => {
  const map = filtersToInitialState(props.filters)
  if (props.filtersState) {
    for (const [index, state] of props.filtersState) {
      map.set(index, state)
    }
  }
  return map
})()
const initialOrderByState: OrderByState = columnsToInitialOrderByState(props.columns)

const filtersState = ref<FiltersState>(carbonCopyMap(initialFilterState))
const orderByState = ref<OrderByState>(carbonCopyMap(initialOrderByState))

const currentFilters = computed(() => filterStateToClauses(filtersState.value, props.filters))
const currentOrderBy = computed(() => orderByStateToClauses(orderByState.value))

const initialStateActive = computed<boolean>(
  () =>
    filtersState.value.size === initialFilterState.size &&
    orderByState.value.size === initialOrderByState.size &&
    [...filtersState.value.entries()].every(
      ([key, value]) => initialFilterState.get(key) === value
    ) &&
    [...orderByState.value.entries()].every(
      ([key, value]) => initialOrderByState.get(key) === value
    )
)
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
  filtersState.value = carbonCopyMap(initialFilterState)
  orderByState.value = carbonCopyMap(initialOrderByState)
  clearAllRecords()
  fetchMore()
}

function clearState(): void {
  filtersState.value = new Map()
  orderByState.value = new Map()
  clearAllRecords()
  fetchMore()
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

const rows = computed(() => {
  const collection = collectionInstance.value
  return [...collection.data.values()]
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

    const whereClauses = isString(payload) ? [] : isArray(payload) ? [payload] : [...payload.or]
    // : 'and' in payload
    // ? [...payload.and]
    // : [...payload.or]
    const firstWhereClause = whereClauses[0]

    const op: WhereFilterOp = firstWhereClause?.[1]
    /**
     * Optionally an `orderBy` might need to be set for a certain where filter
     *
     * An example error from firestore:
     * > Invalid query. You have a where filter with an inequality (<, <=, !=, not-in, >, or >=) on field 'title' and so you must also use 'title' as your first argument to orderBy(), but your first orderBy() is on field 'isDone' instead.
     */
    const alsoApplyOrderBy =
      op === '!=' || op === '<' || op === '<=' || op === '>' || op === '>=' || op === 'not-in'
    if (firstWhereClause && alsoApplyOrderBy) {
      const fieldPath = firstWhereClause[0]
      const direction = 'asc'
      // must be inserted at position 0
      orderByState.value = new Map([[fieldPath, direction], ...orderByState.value.entries()])
    }
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
  if (direction) orderByState.value.set(fieldPath, direction)
  // it looks better UI wise to delay the actual fetch to prevent UI components from freezing
  await new Promise((resolve) => setTimeout(resolve, 200))
  await fetchMore()
}

const showingFiltersCode = ref(false)
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

    <table>
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
        <tr v-for="row in rows" :key="row.id">
          <td
            v-for="(column, columnIndex) in columns"
            :key="(column.fieldPath || column.slot) + 'td' + row.id"
          >
            <slot :name="column.slot || columnIndex" v-bind="{ data: row }">
              <TableTd :row="row" :column="column" :parseLabel="parseLabel"> </TableTd>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <section class="magnetar-table-controls">
      <button :disabled="fetchState === 'end'" @click="() => fetchMore()">
        {{
          fetchState === 'end'
            ? muiLabel('magnetar table fetch-more button end')
            : muiLabel('magnetar table fetch-more button')
        }}
      </button>
    </section>
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
</style>
