<script lang="ts" setup>
import { CollectionInstance, WhereClause } from '@magnetarjs/types'
import { isArray } from 'is-what'
import { computed, onMounted, ref, watch } from 'vue'
import {
  FilterState,
  MUIFilter,
  MUIParseLabel,
  usesFilterStateOr,
  usesFilterStateSingle,
} from '../types'
import { carbonCopyState, whereClausesEqual } from '../utils'

const props = defineProps<{
  collection: CollectionInstance<any>
  filter: MUIFilter<any>
  filterState: FilterState | undefined
  parseLabel: MUIParseLabel | undefined
}>()

const emit = defineEmits<{
  (e: 'setFilter', payload: FilterState | null): void
}>()

/** Used for being able to type guard in the DOM */
const filterAndState = computed<[filter: MUIFilter<any>, state?: FilterState]>(() => {
  return [props.filter, props.filterState]
})

onMounted(() => {
  // filters with options will fetch the "record count" for each where filter in the option
  for (const option of props.filter.options || []) {
    props.collection.where(...option.where).fetchCount()
  }
})

function setCheckbox(whereClause: WhereClause, to: boolean) {
  const { filter, filterState } = props
  if (!usesFilterStateOr(filter, filterState)) return undefined
  const newState = !filterState
    ? { or: new Set<WhereClause>() }
    : { or: carbonCopyState(filterState.or) }
  if (!to) {
    newState.or.delete(whereClause)
  } else {
    newState.or.add(whereClause)
  }
  return emit('setFilter', newState)
}

function setRadioTo(whereClause: WhereClause | null) {
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

watch(inputModel, (userInput: any) => {
  const { filter } = props
  if (filter.type !== 'text' && filter.type !== 'number' && filter.type !== 'date') return undefined
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
    <legend>{{ filterAttrs.label }}</legend>

    <template v-if="filter.type === 'checkboxes' && usesFilterStateOr(filter, filterState)">
      <!-- CHECKBOXES -->
      <div v-for="option in filterAndState[0].options" class="magnetar-inline-block">
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
        <input v-model="inputModel" :type="filter.type" :placeholder="filterAttrs.placeholder" />
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
