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

const cellAttrs = computed<{ class: string | undefined; style: string | undefined }>(() => {
  const { column, row } = props
  const rawValue = cellValueRaw.value
  return {
    class: isFunction(column.class) ? column.class({ data: row, value: rawValue }) : column.class,
    style: isFunction(column.style) ? column.style({ data: row, value: rawValue }) : column.style,
  }
})

const buttonLoadingArr = ref<boolean[]>(props.column.buttons?.map(() => false) || [])

const buttonAttrArr = computed<{ label: string; disabled: boolean | undefined }[]>(() => {
  const { column, row, parseLabel } = props
  const rawValue = cellValueRaw.value

  return (column.buttons || []).map((button, index) => {
    const text = isFunction(button.label)
      ? button.label({ data: row, value: rawValue })
      : button.label
    const label = parseLabel ? parseLabel(text) : text

    const disabled = buttonLoadingArr.value[index]
      ? true
      : isFunction(button.disabled)
      ? button.disabled({ data: row, value: rawValue })
      : button.disabled

    return { label, disabled }
  })
})

async function handleClick(index: number): Promise<void> {
  const { row, column } = props
  const rawValue = cellValueRaw.value
  const button = column.buttons?.[index]
  if (!button) return
  buttonLoadingArr.value[index] = true
  try {
    await button.handler?.({ data: row, value: rawValue })
  } catch (error: unknown) {
    console.error(error)
  }
  buttonLoadingArr.value[index] = false
}
</script>

<template>
  <td class="magnetar-table-td" :class="cellAttrs.class" :style="cellAttrs.style">
    <div>
      <div>{{ cellValueParsed }}</div>
      <button
        v-for="(button, i) in buttonAttrArr"
        :key="button?.label"
        :disabled="button.disabled || undefined"
        @click.stop="() => handleClick(i)"
      >
        {{ button.label }}
      </button>
    </div>
  </td>
</template>

<style scoped></style>
