<script lang="ts" setup>
import { CollectionInstance, WhereClause } from '@magnetarjs/types'
import { computed, watch } from 'vue'
import {
  FilterState,
  MUIFilter,
  MUIParseLabel,
  usesFilterStateCheckboxes,
  usesFilterStateInputValue,
  usesFilterStateOption,
} from '../types'
import { whereClausesEqual } from '../utils/tableHelpers'

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
  if (!usesFilterStateCheckboxes(filter, filterState)) return
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
    if (!usesFilterStateOption(filter, filterState)) return undefined
    return filter.options?.find((o) => whereClausesEqual(o.where, filterState))?.where
  },
  set: (where: WhereClause | undefined) => setRadioTo(where || null),
})

let timeoutDebounce: any

/**
 * For filter `type: 'text' | 'number' | 'date'`.
 * Bound to `<input v-model="inputModel" />`
 */
const inputModel = computed<string | null>({
  get: (): string | null => {
    const { filter, filterState } = props
    if (!usesFilterStateInputValue(filter, filterState)) return null
    return filterState || null
  },
  set: (userInput: string | null): void => {
    clearTimeout(timeoutDebounce)
    timeoutDebounce = setTimeout(() => {
      const { filter } = props
      if (filter.type !== 'text' && filter.type !== 'number' && filter.type !== 'date') {
        return
      }
      emit('setFilter', userInput || null)
    }, 300)
  },
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

    <template v-if="filter.type === 'checkboxes' && usesFilterStateCheckboxes(filter, filterState)">
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

    <template v-if="filter.type === 'radio' && usesFilterStateOption(filter, filterState)">
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

    <template v-if="filter.type === 'select' && usesFilterStateOption(filter, filterState)">
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
../tableHelpers
