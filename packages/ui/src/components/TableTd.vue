<script lang="ts" setup>
import { computedAsync } from '@vueuse/core'
import { isFunction } from 'is-what'
import { getProp } from 'path-to-prop'
import { computed, ref } from 'vue'
import { Codable, MUIColumn, MUIParseLabel } from '../types'

const props = defineProps<{
  column: MUIColumn<any>
  row: Record<string, any>
  parseLabel: MUIParseLabel | undefined
  isExpanded: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isExpanded', value: boolean): void
}>()

const isExpanded = computed<boolean>({
  get: () => props.isExpanded,
  set: (newValue) => emit('update:isExpanded', newValue),
})

const isFetchingCell = ref(false)
const cellValueRaw = computedAsync<any>(
  async () => {
    const { column, row } = props
    const { fieldPath, fetchValue } = column
    if (fetchValue) {
      const fetchedValue = await fetchValue({ data: row })
      return fetchedValue
    }
    return fieldPath ? getProp(row, fieldPath) : undefined
  },
  (() => {
    const { column, row } = props
    const { fieldPath } = column
    return fieldPath ? getProp(row, fieldPath) : undefined
  })(),
  isFetchingCell
)

/** Any `Codable<...>` prop or handler will use this payload, so we prep it here. */
const codablePayload = computed<{ data: Record<string, any>; value: any; isExpanded: boolean }>(
  () => ({
    data: props.row,
    value: cellValueRaw.value,
    isExpanded: isExpanded.value,
  })
)

/** Any type that has `Codable<...>` should be piped through this. */
function evaluateCodableProp<T>(prop: T | Codable<Record<string, any>, T>): T {
  return isFunction(prop) ? prop(codablePayload.value) : prop
}

const cellValueParsed = computed<string>(() => {
  const { parseValue, fetchValue } = props.column
  const rawValue = cellValueRaw.value
  return !!fetchValue && isFetchingCell.value
    ? '...'
    : parseValue
    ? parseValue(codablePayload.value)
    : rawValue
})

const cellAttrs = computed<{ class: string | undefined; style: string | undefined }>(() => ({
  class: evaluateCodableProp(props.column.class),
  style: evaluateCodableProp(props.column.style),
}))

const buttonLoadingArr = ref<boolean[]>(props.column.buttons?.map(() => false) || [])

const buttonAttrArr = computed<
  { label: string; disabled?: boolean; class?: string; style?: string; html?: boolean }[]
>(() => {
  const { column, parseLabel } = props

  return (column.buttons || []).map((button, index) => {
    return {
      html: button.html,
      label: isFunction(button.label)
        ? evaluateCodableProp(button.label)
        : parseLabel
        ? parseLabel(button.label)
        : button.label,
      class: evaluateCodableProp(button.class),
      style: evaluateCodableProp(button.style),
      disabled: buttonLoadingArr.value[index] ? true : evaluateCodableProp(button.disabled),
    }
  })
})

async function handleClick(index: number): Promise<void> {
  const { column } = props
  const button = column.buttons?.[index]
  if (!button) return
  buttonLoadingArr.value[index] = true
  try {
    await button.handler?.({
      data: props.row,
      value: cellValueRaw.value,
      isExpanded,
    })
  } catch (error: unknown) {
    console.error(error)
  }
  buttonLoadingArr.value[index] = false
}
</script>

<template>
  <div :class="cellAttrs.class" :style="cellAttrs.style">
    <div v-if="column.html" v-html="cellValueParsed" />
    <div v-if="!column.html">{{ cellValueParsed }}</div>
    <template v-for="(button, i) in buttonAttrArr" :key="button?.label">
      <button
        v-if="button.html"
        :disabled="button.disabled || undefined"
        :class="button.class"
        :style="button.style"
        @click.stop="() => handleClick(i)"
        v-html="button.label"
      />
      <button
        v-if="!button.html"
        :disabled="button.disabled || undefined"
        :class="button.class"
        :style="button.style"
        @click.stop="() => handleClick(i)"
      >
        {{ button.label }}
      </button>
    </template>
  </div>
</template>

<style scoped></style>
