<script lang="ts" setup>
import type { CollectionInstance, QueryClause, WhereClause } from '@magnetarjs/types'
import { isAnyObject, isArray } from 'is-what'
import { computed, watch } from 'vue'
import {
  FilterState,
  MUIFilter,
  MUIParseLabel,
  usesFilterStateCheckboxes,
  usesFilterStateInputValue,
  usesFilterStateOption,
} from '../types'
import { clausesEqual } from '../utils/tableHelpers'

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

function setCheckbox(clause: WhereClause | QueryClause | undefined, enabled: boolean): void {
  if (!clause) return

  const { filter, filterState } = props
  if (!usesFilterStateCheckboxes(filter, filterState)) return

  let or = !filterState ? [] : filterState.or

  const existingIndex = or.findIndex((_clause) => clausesEqual(_clause, clause))
  if (!enabled && existingIndex !== -1) {
    or.splice(existingIndex, 1)
  }
  if (enabled && existingIndex === -1) {
    or.push(clause)
  }

  if (or.length === 0) {
    emit('setFilter', null)
  } else {
    emit('setFilter', { or })
  }
}

function setOptionTo(clause: WhereClause | QueryClause | null | undefined): void {
  if (clause === undefined) {
    console.error(ERROR_NO_CLAUSE)
    return
  }
  if (clause === null) {
    emit('setFilter', null)
    return
  }
  if (isArray(clause)) {
    emit('setFilter', { and: [clause] })
  } else {
    emit('setFilter', clause)
  }
}

const selectModel = computed<WhereClause | QueryClause | undefined>({
  get: () => {
    const { filter, filterState } = props
    if (!usesFilterStateOption(filter, filterState)) return undefined
    const clause = filter.options?.find((o) =>
      clausesEqual(o.where ? { and: [o.where] } : o.query, filterState)
    )
    return clause?.where || clause?.query
  },
  set: (clause) => setOptionTo(clause),
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
      <div
        v-for="option in filter.options"
        class="magnetar-inline-block"
        :class="option.class"
        :style="option.style"
      >
        <input
          :id="JSON.stringify(option.where || option.query)"
          type="checkbox"
          :checked="
            !!filterState?.or?.find((_clause) =>
              clausesEqual(_clause, option.where || option.query)
            )
          "
          @change="(e) => setCheckbox(option.where || option.query, (e.target as HTMLInputElement)?.checked || false)"
        />
        <label :for="JSON.stringify(option.where || option.query)"
          >{{ parseLabel ? parseLabel(option.label) : option.label }}
          <small> ({{ calcCollection(option.where || option.query).count }})</small></label
        >
      </div>
    </template>

    <template v-if="filter.type === 'radio' && usesFilterStateOption(filter, filterState)">
      <!-- RADIO -->
      <div
        v-for="option in filter.options"
        class="magnetar-inline-block"
        :class="option.class"
        :style="option.style"
      >
        <input
          :id="JSON.stringify(option.where || option.query)"
          type="radio"
          :checked="clausesEqual(filterState, option.where || option.query)"
          @change="(e) =>
              setOptionTo((e.target as HTMLInputElement)?.checked ? (option.where || option.query) : null)
            "
        />
        <label :for="JSON.stringify(option.where || option.query)"
          >{{ parseLabel ? parseLabel(option.label) : option.label }}
          <small> ({{ calcCollection(option.where || option.query).count }})</small></label
        >
      </div>
    </template>

    <template v-if="filter.type === 'select' && usesFilterStateOption(filter, filterState)">
      <!-- SELECT -->
      <select v-model="selectModel">
        <option :value="null">{{ filterAttrs.placeholder || '--' }}</option>
        <option
          v-for="option in filter.options"
          :key="option.label"
          :value="option.where || option.query"
          :class="option.class"
          :style="option.style"
        >
          {{ parseLabel ? parseLabel(option.label) : option.label }}
          <small> ({{ calcCollection(option.where || option.query).count }})</small>
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
