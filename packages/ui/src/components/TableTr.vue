<script setup lang="ts">
import { computed, ref } from 'vue'
import { MUIColumn, MUIParseLabel, MUITableSlot } from '../types'
import TableTd from './TableTd.vue'

const props = defineProps<{
  row: any
  columns: MUIColumn<any, any>[]
  parseLabel?: MUIParseLabel
}>()

const isExpanded = ref(false)

const rowSlotContext = computed<MUITableSlot<any>>(() => ({
  data: props.row,
  isExpanded,
  value: undefined,
}))
</script>

<template>
  <tr>
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
