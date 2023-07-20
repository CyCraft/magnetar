<script lang="ts" setup>
import { computed } from 'vue'
import { MUIColumn, MUIParseLabel, OPaths, OrderByState } from '../types'

const props = defineProps<{
  column: MUIColumn<any>
  orderByState: OrderByState
  parseLabel: MUIParseLabel | undefined
}>()

const emit = defineEmits<{
  (e: 'setOrderBy', payload: [OPaths<any>, 'asc' | 'desc' | undefined]): void
}>()

const direction = computed<'asc' | 'desc' | 'sortable' | 'unsortable'>(() => {
  const { column, orderByState } = props
  const { fieldPath, sortable } = column
  if (!sortable || !fieldPath) return 'unsortable'
  const direction = orderByState.get(fieldPath)
  return direction || 'sortable'
})

function onClick(e: MouseEvent) {
  const { column } = props
  const fieldPath = column.fieldPath

  if (direction.value === 'unsortable' || !fieldPath) return

  e.stopPropagation()

  if (direction.value === 'sortable') {
    emit('setOrderBy', [fieldPath, 'desc'])
    return
  }
  if (direction.value === 'desc') {
    emit('setOrderBy', [fieldPath, 'asc'])
    return
  }
  if (direction.value === 'asc') {
    emit('setOrderBy', [fieldPath, undefined])
    return
  }
}

const label = computed<string>(() => {
  const { column, parseLabel } = props
  const { fieldPath, label } = column
  const text = label || fieldPath || ''
  return parseLabel ? parseLabel(text) : text
})
</script>

<template>
  <th :class="`magnetar-table-th _direction-${direction}`" @click="(e) => onClick(e)">
    <div>
      <div>{{ label }}</div>
      <i v-if="direction !== 'unsortable'" class="_sort-arrows"></i>
    </div>
  </th>
</template>

<style scoped lang="sass">
.magnetar-table-th
  > div
    display: flex
    gap: 0.25rem
    align-items: center
._sort-arrows
  float: right
  box-sizing: border-box
  position: relative
  display: block
  transform: scale(1)
  width: 22px
  height: 22px
._sort-arrows::after,
._sort-arrows::before
  content: ''
  display: block
  box-sizing: border-box
  position: absolute
  width: 8px
  height: 8px
  left: 7px
  transform: rotate(-45deg)
._sort-arrows::before
  border-left: 2px solid
  border-bottom: 2px solid
  bottom: 4px
  opacity: 0.3
._sort-arrows::after
  border-right: 2px solid
  border-top: 2px solid
  top: 4px
  opacity: 0.3
._direction-asc,
._direction-desc,
._direction-sortable
  cursor: pointer
  user-select: none
._direction-asc ._sort-arrows::after
  opacity: 1
._direction-desc ._sort-arrows::before
  opacity: 1
</style>
