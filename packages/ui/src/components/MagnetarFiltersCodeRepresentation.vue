<script setup lang="ts">
import { arrStr } from '@magnetarjs/utils'
import { isArray } from 'is-what'
import { computed } from 'vue'
import { FilterState, FiltersState, MUIFilter, OPaths, OrderByState } from '../types'
import { filterStateToClauses, orderByStateToClauses } from '../utils/tableHelpers'

const props = defineProps<{
  labels: {
    'magnetar table no active filters': string
  }
  hasSomeFilterOrOrderby: boolean
  filters?: MUIFilter<any, any>[]
  filtersState: FiltersState
  orderByState: OrderByState
}>()

const emit = defineEmits<{
  (
    e: 'setFilter',
    payload: {
      filterIndex: number
      payload: null | FilterState
    }
  ): void
  (
    e: 'setOrderBy',
    payload: {
      fieldPath: OPaths<any>
      direction: 'asc' | 'desc' | null
      clearOtherOrderBy?: boolean
    }
  ): void
}>()

const currentFilters = computed(() => filterStateToClauses(props.filtersState, props.filters ?? []))
const currentOrderBy = computed(() => orderByStateToClauses(props.orderByState))
</script>

<template>
  <div class="magnetar-row magnetar-gap-sm">
    <div v-if="!hasSomeFilterOrOrderby">{{ labels['magnetar table no active filters'] }}</div>
    <div v-for="info in currentFilters" :key="info.filterIndex" class="magnetar-filter-code">
      {{
        isArray(info.result)
          ? info.result.map((where) => `.where(${arrStr(where)})`).join('')
          : `.query(${JSON.stringify(info.result)})`
      }}
      <button @click="() => emit('setFilter', { filterIndex: info.filterIndex, payload: null })">
        ✕
      </button>
    </div>
    <div
      v-for="_orderBy in currentOrderBy"
      :key="JSON.stringify(_orderBy)"
      class="magnetar-filter-code"
    >
      .orderBy({{ arrStr(_orderBy) }})
      <button @click="() => emit('setOrderBy', { fieldPath: _orderBy[0], direction: null })">
        ✕
      </button>
    </div>
  </div>
</template>

<style lang="sass" src="./styles.sass" />

<style lang="sass" scoped>
.magnetar-filter-code
  background: var(--c-primary-extra-light, whitesmoke)
  border-radius: 0.25rem
  padding: 0.25rem 0.5rem
  display: flex
  align-items: center
  gap: 0.25rem
</style>
