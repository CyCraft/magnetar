<script lang="ts" setup>
import { getProp } from 'path-to-prop'
import { computed, ref } from 'vue'
import { Codable, MUIColumn, MUIParseLabel, MUITableSlot, isCodable } from '../types.js'
import { computedAsync } from '../utils/computedAsync.js'

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

/**
 * Represents the cell value BEFORE `parseValue` is applied.
 *
 * Fetches the value when `fetchValue` is defined.
 */
const cellValueRaw = computedAsync<any>(
  async () => {
    const { column, row } = props
    const { fieldPath, fetchValue } = column
    if (fetchValue) {
      const fetchedValue = await fetchValue({ data: row })
      return computed(() => fetchedValue)
    }
    return computed(() => (fieldPath ? getProp(row, fieldPath) : undefined))
  },
  (() => {
    const { column, row } = props
    const { fieldPath } = column
    return fieldPath ? getProp(row, fieldPath) : undefined
  })(),
  isFetchingCell
)

/** Any `Codable<...>` prop or handler will use this payload, so we prep it here. */
const codablePayload = computed<Parameters<Codable<any, any>>[0]>(() => ({
  data: props.row,
  value: cellValueRaw.value,
  isExpanded: isExpanded.value,
}))

/** Any type that has `Codable<...>` should be piped through this. */
function evaluateCodableProp<T>(prop: T | Codable<Record<string, any>, T>): T {
  return isCodable(prop) ? prop(codablePayload.value) : prop
}

/**
 * Represents the cell value AFTER `parseValue` is applied.
 *
 * Uses {@link cellValueRaw} under the hood.
 */
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
      label: isCodable(button.label)
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

const rowSlotContext = computed<MUITableSlot<any>>(() => ({
  data: props.row,
  isExpanded,
  value: cellValueRaw.value,
  class: cellAttrs.value.class,
  style: cellAttrs.value.style,
}))
</script>

<template>
  <slot v-bind="rowSlotContext">
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
  </slot>
</template>

<style scoped></style>
