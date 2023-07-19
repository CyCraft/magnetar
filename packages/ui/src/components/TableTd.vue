<script lang="ts" setup>
import { isFunction } from 'is-what'
import { getProp } from 'path-to-prop'
import { computed } from 'vue'
import { MUIColumn } from '../types'

const props = defineProps<{
  column: MUIColumn<any>
  row: Record<string, any>
}>()

const cellValueRaw = computed<any>(() => {
  const { column, row } = props
  const { fieldPath } = column
  if (!fieldPath) return undefined
  return getProp(row, fieldPath)
})

const cellValueParsed = computed<string>(() => {
  const { parseValue } = props.column
  const rawValue = cellValueRaw.value
  return parseValue ? parseValue({ value: rawValue, data: props.row }) : rawValue
})

const buttonLabel = computed<string>(() => {
  const { column, row } = props
  if (!column.button) return ''
  return isFunction(column.button.label) ? column.button.label({ data: row }) : column.button.label
})
</script>

<template>
  <td class="magnetar-table-td">
    <template v-if="!column.button">
      {{ cellValueParsed }}
    </template>
    <template v-if="column.button">
      <button @click.stop="() => column.button?.handler?.({ data: row })">{{ buttonLabel }}</button>
    </template>
  </td>
</template>

<style scoped></style>
