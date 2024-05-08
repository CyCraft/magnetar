<script setup lang="ts">
import { computed, ref } from 'vue'
import { MUIColumn, MUIParseLabel, MUITableSlot, MUIRowMeta, Codable } from '../types'
import TableTd from './TableTd.vue'
import { isFunction } from 'is-what'

const props = defineProps<{
  row: any
  columns: MUIColumn<any, any>[]
  parseLabel?: MUIParseLabel
  rowMeta: MUIRowMeta | undefined
}>()

const isExpanded = ref(false)

/** Any `Codable<...>` prop or handler will use this payload, so we prep it here. */
const codablePayload = computed<Parameters<Codable<any, any>>[0]>(() => ({
  data: props.row,
  value: undefined,
  isExpanded: isExpanded.value,
}))

/** Any type that has `Codable<...>` should be piped through this. */
function evaluateCodableProp<T>(prop: T | Codable<Record<string, any>, T>): T {
  return isFunction(prop) ? prop(codablePayload.value) : prop
}

const rowAttrs = computed<{ class: string | undefined; style: string | undefined }>(() => ({
  class: evaluateCodableProp(props.rowMeta?.class),
  style: evaluateCodableProp(props.rowMeta?.style),
}))

const rowSlotContext = computed<MUITableSlot<any>>(() => ({
  data: props.row,
  isExpanded,
  value: undefined,
  class: rowAttrs.value.class,
  style: rowAttrs.value.style,
}))
</script>

<template>
  <tr :class="rowAttrs.class" :style="rowAttrs.style">
    <td
      v-for="(column, columnIndex) in columns"
      :key="(column.fieldPath || column.slot) + 'td' + row.id"
    >
      <TableTd
        ref="tableTdInstance"
        v-model:isExpanded="isExpanded"
        :row="row"
        :column="column"
        :parseLabel="parseLabel"
      >
        <template #default="ctx">
          <slot :name="column.slot || columnIndex" v-bind="ctx" />
        </template>
      </TableTd>
    </td>
  </tr>
  <tr v-if="isExpanded" class="magnetar-expansion">
    <td :colspan="columns.length">
      <slot name="expansion" v-bind="rowSlotContext">
        <div>set up <code style="padding: 0 4px"> #expansion </code> in template</div>
      </slot>
    </td>
  </tr>
</template>

<style lang="sass" scoped></style>
