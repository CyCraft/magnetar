<script lang="ts" setup>
import { CollectionInstance, WhereClause } from '@magnetarjs/types'
import { isArray } from 'is-what'
import { computed, ref, watch } from 'vue'
import {
  FilterState,
  MUIFilter,
  MUIParseLabel,
  usesFilterStateOr,
  usesFilterStateSingle,
} from '../types'
import { whereClausesEqual } from '../utils'

const props = defineProps<{
  collection: CollectionInstance<any>
  filter: MUIFilter<any>
  filterState: FilterState | undefined
  parseLabel: MUIParseLabel | undefined
}>()

const emit = defineEmits<{
  (e: 'setFilter', payload: FilterState | null): void
}>()

watch(
  () => props.filter.options?.length,
  () => {
    const options = props.filter.options || []
    // filters with options will fetch the "record count" for each where filter in the option
    for (const option of options) {
      props.collection.where(...option.where).fetchCount()
    }
  },
  { immediate: true }
)

function setCheckbox(whereClause: WhereClause, to: boolean): void {
  const { filter, filterState } = props
  if (!usesFilterStateOr(filter, filterState)) return
  const or = !filterState ? new Set<WhereClause>() : filterState.or
  if (!to) {
    or.delete(whereClause)
  } else {
    or.add(whereClause)
  }
  if (or.size === 0) {
    emit('setFilter', null)
  } else {
    emit('setFilter', { or })
  }
}

function setRadioTo(whereClause: WhereClause | null): void {
  if (!whereClause) return emit('setFilter', null)
  return emit('setFilter', whereClause)
}

const selectModel = computed({
  get: (): WhereClause | undefined => {
    const { filter, filterState } = props
    if (!usesFilterStateSingle(filter, filterState)) return undefined
    return filter.options?.find((o) => whereClausesEqual(o.where, filterState))?.where
  },
  set: (where: WhereClause | undefined) => setRadioTo(where || null),
})

/**
 * For filter `type: 'text' | 'number' | 'date'`.
 * Bound to `<input v-model="inputModel" />`
 */
const inputModel = ref<any>('')

let timeout: any

watch(inputModel, (userInput: any) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    const { filter } = props
    if (filter.type !== 'text' && filter.type !== 'number' && filter.type !== 'date')
      return undefined
    if (!userInput) {
      // remove filter
      emit('setFilter', null)
      return
    }

    const whereClauseSpecs = isArray(filter.where) ? [filter.where] : filter.where.or
    const whereClauses: WhereClause[] =
      whereClauseSpecs?.map<WhereClause>((spec) => {
        const [fieldPath, op, parseInput] = spec
        return [fieldPath, op, parseInput(userInput)]
      }) || []
    emit('setFilter', { or: new Set<WhereClause>(whereClauses) })
    return
  }, 300)
})

const filterAttrs = computed<{
  label: string
  placeholder?: string
  prefix?: string
  suffix?: string
}>(() => {
  const { filter, parseLabel } = props
  const label = parseLabel ? parseLabel(filter.label) : filter.label
  const placeholder = parseLabel ? parseLabel(filter.placeholder) : filter.placeholder
  const prefix = parseLabel ? parseLabel(filter.prefix) : filter.prefix
  const suffix = parseLabel ? parseLabel(filter.suffix) : filter.suffix
  return { label, placeholder, prefix, suffix }
})
</script>

<template>
  <fieldset class="magnetar-table-filter" :class="filter.class" :style="filter.style">
    <legend class="magnetar-row magnetar-gap-sm">
      {{ filterAttrs.label }}
      <button v-if="filterState" @click="() => emit('setFilter', null)">✕</button>
    </legend>

    <template v-if="filter.type === 'checkboxes' && usesFilterStateOr(filter, filterState)">
      <!-- CHECKBOXES -->
      <div v-for="option in filter.options" class="magnetar-inline-block">
        <input
          :id="JSON.stringify(option.where)"
          type="checkbox"
          :checked="filterState?.or?.has(option.where) || false"
          @change="(e) => setCheckbox(option.where, (e.target as HTMLInputElement)?.checked || false)"
        />
        <label :for="JSON.stringify(option.where)"
          >{{ parseLabel ? parseLabel(option.label) : option.label }}
          <small> ({{ props.collection.where(...option.where).count }})</small></label
        >
      </div>
    </template>

    <template v-if="filter.type === 'radio' && usesFilterStateSingle(filter, filterState)">
      <!-- RADIO -->
      <div v-for="option in filter.options" class="magnetar-inline-block">
        <input
          :id="JSON.stringify(option.where)"
          type="radio"
          :checked="whereClausesEqual(filterState, option.where)"
          @change="(e) =>
              setRadioTo((e.target as HTMLInputElement)?.checked ? option.where : null)
            "
        />
        <label :for="JSON.stringify(option.where)"
          >{{ parseLabel ? parseLabel(option.label) : option.label }}
          <small> ({{ props.collection.where(...option.where).count }})</small></label
        >
      </div>
    </template>

    <template v-if="filter.type === 'select' && usesFilterStateSingle(filter, filterState)">
      <!-- SELECT -->
      <select v-model="selectModel">
        <option>{{ filterAttrs.placeholder || '--' }}</option>
        <option v-for="option in filter.options" :key="option.label" :value="option.where">
          {{ parseLabel ? parseLabel(option.label) : option.label }}
          <small> ({{ props.collection.where(...option.where).count }})</small>
        </option>
      </select>
    </template>

    <template v-if="filter.type === 'text' || filter.type === 'number' || filter.type === 'date'">
      <!-- INPUT (text, number, date) -->
      <div class="magnetar-row magnetar-gap-sm">
        <span v-if="filterAttrs.prefix">{{ filterAttrs.prefix }}</span>
        <input
          v-model="inputModel"
          :type="filter.type === 'text' ? 'search' : filter.type"
          :placeholder="filterAttrs.placeholder"
        />
        <span v-if="filterAttrs.suffix">{{ filterAttrs.suffix }}</span>
      </div>
    </template>
  </fieldset>
</template>

<style lang="sass" scoped>
.magnetar-table-filter
  border: thin solid
  .magnetar-inline-block
    display: inline-block
    > label
      margin: 0.25rem
</style>
