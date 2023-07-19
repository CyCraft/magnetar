<script lang="ts" setup>
import { CollectionInstance, WhereClauseTuple } from '@magnetarjs/types'
import { isBoolean } from 'is-what'
import { computed, onMounted } from 'vue'
import { FilterState, MUIFilter } from '../types'

const props = defineProps<{
  collection: CollectionInstance<any>
  filter: MUIFilter<any>
  filterState: FilterState
}>()

const emit = defineEmits<{
  (e: 'setFilter', payload: [WhereClauseTuple<any, any, any>, boolean]): void
}>()

const selectModel = computed({
  get: (): WhereClauseTuple<any, any, any> | undefined =>
    props.filter.options?.find((o) => !!props.filterState.get(o.where))?.where,
  set: (where: WhereClauseTuple<any, any, any> | undefined) => {
    if (!where) setAllOptions(false)
    if (where) set(where, true, false)
  },
})

function setAllOptions(to: boolean) {
  for (const option of props.filter.options || []) {
    emit('setFilter', [option.where, to])
  }
}

function set(where: WhereClauseTuple<any, any, any>, to: boolean, setOthersTo?: boolean): void {
  if (isBoolean(setOthersTo)) setAllOptions(setOthersTo)
  emit('setFilter', [where, to])
}

onMounted(() => {
  for (const option of props.filter.options || []) {
    props.collection.where(...option.where).fetchCount()
  }
})
</script>

<template>
  <fieldset class="magnetar-table-filter">
    <legend>{{ filter.label }}</legend>
    <template v-if="filter.type === 'checkboxes'">
      <template v-for="option in filter.options">
        <input
          :id="JSON.stringify(option.where)"
          type="checkbox"
          :checked="filterState.get(option.where)"
          @change="(e) => set(option.where, (e.target as HTMLInputElement)?.checked || false)"
        />
        <label :for="JSON.stringify(option.where)"
          >{{ option.label }}
          <small>({{ props.collection.where(...option.where).count }})</small></label
        >
      </template>
    </template>
    <template v-if="filter.type === 'radio'">
      <template v-for="option in filter.options">
        <input
          :id="JSON.stringify(option.where)"
          type="radio"
          :checked="filterState.get(option.where)"
          @change="(e) =>
            set(option.where, (e.target as HTMLInputElement)?.checked || false, false)
          "
        />
        <label :for="JSON.stringify(option.where)"
          >{{ option.label }}
          <small>({{ props.collection.where(...option.where).count }})</small></label
        >
      </template>
    </template>
    <template v-if="filter.type === 'select'">
      <select v-model="selectModel">
        <option>-- ✗ --</option>
        <option v-for="option in filter.options" :key="option.label" :value="option.where">
          {{ option.label }} <small>({{ props.collection.where(...option.where).count }})</small>
        </option>
      </select>
    </template>
  </fieldset>
</template>

<style lang="sass" scoped>
.magnetar-table-filter
  > label
    margin: 0.25rem
</style>
