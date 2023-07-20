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
  columns: MUIColumn<any>[]
  pagination: MUIPagination
  filters: MUIFilter<any, any, any>[]
  parseLabel?: MUIParseLabel
}>()

function muiLabel(label: MUILabel): string {
  return props.parseLabel ? props.parseLabel(label) || muiLabelDic[label] : muiLabelDic[label]
}

// const emit = defineEmits<{}>()
const fetchState = ref<'ok' | 'end' | 'fetching' | { error: string }>('ok')

const initialFilterState: FilterState = filtersToInitialState(props.filters)
const initialOrderByState: OrderByState = columnsToInitialOrderByState(props.columns)

const filterState = ref<FilterState>(carbonCopyMap(initialFilterState))
const orderByState = ref<OrderByState>(carbonCopyMap(initialOrderByState))

const currentFilters = computed(() => filterStateToClauses(filterState.value))
const currentOrderBy = computed(() => orderByStateToClauses(orderByState.value))

const initialStateActive = computed<boolean>(
  () =>
    filterState.value.size === initialFilterState.size &&
    orderByState.value.size === initialOrderByState.size &&
    [...filterState.value.entries()].every(
      ([key, value]) => initialFilterState.get(key) === value
    ) &&
    [...orderByState.value.entries()].every(
      ([key, value]) => initialOrderByState.get(key) === value
    )
)
const hasSomeFilterOrOrderby = computed<boolean>(
  () => !!filterState.value.size || !!orderByState.value.size
)

/** This instance is not computed so that we can delay setting it after fetching the relevant records */
const collectionInstance = ref(
  calcCollection(props.collection, filterState.value, orderByState.value)
)

function clearAllRecords(): void {
  props.collection.data.clear()
  collectionInstance.value.fetched.cursor = undefined
}

function resetState(): void {
  filterState.value = carbonCopyMap(initialFilterState)
  orderByState.value = carbonCopyMap(initialOrderByState)
  clearAllRecords()
  fetchMore()
}

function clearState(): void {
  filterState.value = new Map()
  orderByState.value = new Map()
  clearAllRecords()
  fetchMore()
}

/** never throws */
async function fetchMore() {
  fetchState.value = 'fetching'
  const collection = calcCollection(props.collection, filterState.value, orderByState.value)

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

async function setFilter(where: WhereClauseTuple<any, any, any>, to: boolean): Promise<void> {
  clearAllRecords()
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
  clearAllRecords()
  if (!direction) orderByState.value.delete(fieldPath)
  if (direction) orderByState.value.set(fieldPath, direction)
  // it looks better UI wise to delay the actual fetch to prevent UI components from freezing
  await new Promise((resolve) => setTimeout(resolve, 200))
  await fetchMore()
}
</script>

<template>
  <div class="magnetar-table magnetar-column magnetar-gap-md">
    <section class="magnetar-row magnetar-gap-md">
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
    </section>

    <section class="magnetar-row magnetar-gap-md">
      <TableFilter
        v-for="filter in filters"
        :filter="filter"
        :filterState="filterState"
        :collection="collection"
        :parseLabel="parseLabel"
        @setFilter="([where, to]) => setFilter(where, to)"
      />
      <div v-if="hasSomeFilterOrOrderby" class="magnetar-column magnetar-gap-sm">
        <h6>{{ muiLabel('magnetar table active filters') }}</h6>
        <div class="magnetar-row magnetar-gap-sm magnetar-active-filters">
          <div v-for="_filter in currentFilters" :key="JSON.stringify(_filter)">
            <!-- TODO: @click="() => filterState.delete(_filter)" -->
            .where({{ _filter.map((f) => JSON.stringify(f)).join(', ') }})
          </div>
          <div v-for="_orderBy in currentOrderBy" :key="JSON.stringify(_orderBy)">
            <!-- TODO: @click="() => orderByState.delete(_orderBy[0])" -->
            .orderBy({{ _orderBy.map((o) => JSON.stringify(o)).join(', ') }})
          </div>
        </div>
      </div>
    </section>

    <TextWithAnchorTags
      v-if="isPlainObject(fetchState)"
      class="magnetar-fetch-state-error"
      :text="fetchState.error"
    />

    <section
      v-if="hasSomeFilterOrOrderby || !initialStateActive"
      class="magnetar-row magnetar-gap-sm"
    >
      <button v-if="!initialStateActive" @click="() => resetState()">
        {{ muiLabel('magnetar table fetch-state reset') }}
      </button>
      <button v-if="hasSomeFilterOrOrderby" @click="() => clearState()">
        {{ muiLabel('magnetar table clear filters button') }}
      </button>
    </section>

    <table>
      <thead>
        <tr>
          <th v-for="(column, i) in columns" :key="column.fieldPath + 'th' + i">
            <TableTh
              :column="column"
              :orderByState="orderByState"
              :parseLabel="parseLabel"
              @setOrderBy="([fieldPath, direction]) => setOrderBy(fieldPath, direction)"
            />
          </th>
        </tr>
      </thead>
      <tbody>
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
        <slot v-if="!rows.length" name="empty">
          <tr>
            <td :colspan="columns.length">
              <div style="min-height: 100px">{{ muiLabel('magnetar table no-results') }}</div>
            </td>
          </tr>
        </slot>
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

<style lang="sass" scoped>
.magnetar-row
  display: flex
  flex-direction: row
  flex-wrap: wrap
  align-items: center
.magnetar-column
  display: flex
  flex-direction: column
.magnetar-gap-sm
  gap: 0.5rem
.magnetar-gap-md
  gap: 1rem
.magnetar-table
  h6
    margin: 0
.magnetar-table-info
  min-height: 26px
.magnetar-fetch-state-error
  color: var(--c-error, indianred)
.magnetar-active-filters
  > div
    background: var(--c-primary-extra-light, whitesmoke)
    border-radius: 0.25rem
    padding: 0.25rem 0.5rem
</style>
