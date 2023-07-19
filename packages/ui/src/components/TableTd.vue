<script lang="ts" setup>
import { isFunction } from 'is-what'
import { getProp } from 'path-to-prop'
import { computed, ref } from 'vue'
import { MUIColumn, MUIParseLabel } from '../types'

const props = defineProps<{
  column: MUIColumn<any>
  row: Record<string, any>
  parseLabel: MUIParseLabel | undefined
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

const buttonsLoading = ref<boolean[]>(props.column.buttons?.map(() => false) || [])

const buttonStates = computed<{ label: string; disabled: boolean | undefined }[]>(() => {
  const { column, row, parseLabel } = props
  return (column.buttons || []).map((button, index) => {
    const text = isFunction(button.label) ? button.label({ data: row }) : button.label
    const label = parseLabel ? parseLabel(text) : text

    const disabled = buttonsLoading.value[index]
      ? true
      : isFunction(button.disabled)
      ? button.disabled({ data: row })
      : button.disabled

    return { label, disabled }
  })
})

async function handleClick(index: number): Promise<void> {
  const { row, column } = props
  const button = column.buttons?.[index]
  if (!button) return
  buttonsLoading.value[index] = true
  try {
    await button.handler?.({ data: row })
  } catch (error: unknown) {
    console.error(error)
  }
  buttonsLoading.value[index] = false
}
</script>

<template>
  <td class="magnetar-table-td">
    {{ cellValueParsed }}
    <button
      v-for="(button, i) in buttonStates"
      :key="button?.label"
      :disabled="button.disabled || undefined"
      @click.stop="() => handleClick(i)"
    >
      {{ button.label }}
    </button>
  </td>
</template>

<style scoped></style>
