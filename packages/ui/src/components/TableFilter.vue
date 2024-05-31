<script lang="ts" setup>
import type { CollectionInstance, QueryClause, WhereClause } from '@magnetarjs/types'
import { isAnyObject, isArray } from 'is-what'
import { computed, watch } from 'vue'
import {
  FilterState,
  MUIFilter,
  MUIFilterOption,
  MUIParseLabel,
  usesFilterStateCheckboxes,
  usesFilterStateInputValue,
  usesFilterStateOption,
} from '../types'
import { clausesEqual } from '../utils/tableHelpers.js'
import FilterCheckboxes from './FilterCheckboxes.vue'
import FilterRadio from './FilterRadio.vue'
import FilterSelect from './FilterSelect.vue'

const props = defineProps<{
  collection: CollectionInstance<any>
  filter: MUIFilter<any>
  filterState: FilterState | undefined
  parseLabel: MUIParseLabel | undefined
}>()

const emit = defineEmits<{
  (e: 'setFilter', payload: FilterState | null): void
}>()

const ERROR_NO_CLAUSE =
  '❗️[@magnetarjs/ui] a filter option needs one prop called `where` or `query`, got undefined'

function calcCollection(clause?: WhereClause | QueryClause): CollectionInstance<any> {
  if (isArray(clause)) {
    return props.collection.where(...clause)
  }
  if (isAnyObject(clause)) {
    return props.collection.query(clause)
  }
  console.error(ERROR_NO_CLAUSE)
  return props.collection
}

watch(
  () => props.filter.options?.length,
  () => {
    const options = props.filter.options || []
    // filters with options will fetch the "record count" for each where filter in the option
    for (const option of options) {
      calcCollection(option.where || option.query).fetchCount()
    }
  },
  { immediate: true }
)

function optionToValue(option?: MUIFilterOption<any, string>): string {
  return JSON.stringify(option?.where || option?.query || '')
}

const filterValueOptionDic = computed<Record<string, MUIFilterOption<Record<string, any>>>>(
  () =>
    props.filter.options?.reduce(
      (dic, option) => ({ ...dic, [optionToValue(option)]: option }),
      {}
    ) || {}
)

const filterOptions = computed<
  { label: string; sublabel?: string; value: string; class?: string; style?: string }[]
>(() =>
  Object.entries(filterValueOptionDic.value).map(([value, option]) => ({
    value,
    label: props.parseLabel ? props.parseLabel(option.label) : option.label,
    sublabel: ` (${calcCollection(option.where || option.query).count})`,
    class: option.class,
    style: option.style,
  }))
)

const selectModel = computed<string | null>({
  get: () => {
    const { filter, filterState } = props
    if (!usesFilterStateOption(filter, filterState)) return null
    const option = filter.options?.find((o) => clausesEqual(o.where || o.query, filterState))
    return optionToValue(option)
  },
  set: (newValue) => {
    if (!newValue) return emit('setFilter', null)
    const option = filterValueOptionDic.value[newValue]
    if (!option) return console.error(ERROR_NO_CLAUSE)
    emit('setFilter', option.where || option.query || null)
  },
})

const checkboxModel = computed<string[]>({
  get: () => {
    const { filter, filterState } = props
    if (!usesFilterStateCheckboxes(filter, filterState)) return []
    return filterState?.or.map((clause) => JSON.stringify(clause || '')) || []
  },
  set: (newValues) => {
    if (!newValues) return emit('setFilter', null)
    const options = newValues.map((newValue) => filterValueOptionDic.value[newValue])
    const or = options
      .map<QueryClause | WhereClause | undefined>((option) => option?.where || option?.query)
      .filter((clause): clause is QueryClause | WhereClause => !!clause)
    if (or.length === 0) {
      emit('setFilter', null)
    } else {
      emit('setFilter', { or })
    }
  },
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
      <FilterCheckboxes v-model="checkboxModel" :options="filterOptions" />
    </template>

    <template v-if="filter.type === 'radio' && usesFilterStateOption(filter, filterState)">
      <!-- RADIO -->
      <FilterRadio v-model="selectModel" :options="filterOptions" />
    </template>

    <template v-if="filter.type === 'select' && usesFilterStateOption(filter, filterState)">
      <!-- SELECT -->
      <FilterSelect
        v-model="selectModel"
        :options="filterOptions"
        :placeholder="filterAttrs.placeholder || '--'"
      />
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

<style lang="sass">
.magnetar-table-filter
  border: thin solid
  .magnetar-inline-block
    display: inline-block
    > label
      margin: 0.25rem
</style>
