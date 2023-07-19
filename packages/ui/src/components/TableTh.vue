<script lang="ts" setup>
import { computed } from 'vue'
import { MUIColumn, OPaths, OrderByState } from '../types'

const props = defineProps<{
  column: MUIColumn<any>
  orderByState: OrderByState
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
    emit('setOrderBy', [fieldPath, 'asc'])
    return
  }
  if (direction.value === 'asc') {
    emit('setOrderBy', [fieldPath, 'desc'])
    return
  }
  if (direction.value === 'desc') {
    emit('setOrderBy', [fieldPath, undefined])
    return
  }
}

const label = computed<string>(() => {
  const { fieldPath, label } = props.column
  return label || fieldPath || ''
})
</script>

<template>
  <th :class="`magnetar-table-th _direction-${direction}`" @click="(e) => onClick(e)">
    {{ label }}
    <i v-if="direction !== 'unsortable'" class="_sort-arrows"></i>
  </th>
</template>

<style scoped>
._sort-arrows {
  float: right;
  box-sizing: border-box;
  position: relative;
  display: block;
  transform: scale(1);
  width: 22px;
  height: 22px;
}
._sort-arrows::after,
._sort-arrows::before {
  content: '';
  display: block;
  box-sizing: border-box;
  position: absolute;
  width: 8px;
  height: 8px;
  left: 7px;
  transform: rotate(-45deg);
}
._sort-arrows::before {
  border-left: 2px solid;
  border-bottom: 2px solid;
  bottom: 4px;
  opacity: 0.3;
}
._sort-arrows::after {
  border-right: 2px solid;
  border-top: 2px solid;
  top: 4px;
  opacity: 0.3;
}
._direction-asc,
._direction-desc,
._direction-sortable {
  cursor: pointer;
  user-select: none;
}
._direction-asc ._sort-arrows::after {
  opacity: 1;
}
._direction-desc ._sort-arrows::before {
  opacity: 1;
}
</style>
