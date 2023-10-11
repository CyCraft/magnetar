<script setup lang="ts">
import { computed, Ref, ref } from 'vue'
import { MUIColumn, MUIParseLabel } from '../types'
import TableTd from './TableTd.vue'

const props = defineProps<{
  row: any
  columns: MUIColumn<any, any>[]
  parseLabel?: MUIParseLabel
}>()

const isExpanded = ref(false)

const rowSlotContext = computed<{ data: any; isExpanded: Ref<boolean> }>(() => ({
  data: props.row,
  isExpanded,
}))
</script>

<template>
  <tr>
    <td
      v-for="(column, columnIndex) in columns"
      :key="(column.fieldPath || column.slot) + 'td' + row.id"
    >
      <slot :name="column.slot || columnIndex" v-bind="rowSlotContext">
        <TableTd
          v-model:isExpanded="isExpanded"
          :row="row"
          :column="column"
          :parseLabel="parseLabel"
        />
      </slot>
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
