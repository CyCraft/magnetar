<script setup lang="ts">
import { PokedexEntry } from '@magnetarjs/test-utils'
import { roll } from 'roll-anything'
import {
  MUIChart,
  MUIColumn,
  MUIFilter,
  MUIParseLabel,
  MUITableSlot,
  MagnetarChartDoughnut,
  MagnetarTable,
} from '../src/index'
import { magnetar } from './magnetar'
import { ref, computed } from 'vue'

type Item = { title: string; id: string; isDone: boolean; name: { family: string } }

const itemsModuleT = magnetar.collection<Item>('magnetarTests/dev-firestore/itemsF')
const dbPokedex = magnetar.collection<PokedexEntry>('magnetarTests/read/pokedex')

// @ts-ignore — added to window to be able to play around in the console
window.itemsModuleT = itemsModuleT

type Label = string[] | string

const magnetarLabelDic = {
  'magnetar table record counts': 'レコード件数',
  'magnetar table fetch-state error default': 'エラーが出ました',
  'magnetar table info counts total': '件 全レコード数',
  'magnetar table info counts filtered': '件 有効フィルター',
  'magnetar table info counts fetched': '件 取得済み',
  'magnetar table info counts showing': '件 表示中',
  'magnetar table fetch-state reset': 'フィルターを初期値に戻す',
  'magnetar table filters': 'フィルター',
  'magnetar table active filters': '有効なフィルター',
  'magnetar table show filters code': 'フィルターのコードを表示する',
  'magnetar table clear filters button': 'すべてのフィルターを消す',
  'magnetar table no active filters': '有効なフィルターがありません',
  'magnetar table no-results': '結果がありません',
  'magnetar table fetch-more button': '追加取得する',
  'magnetar table fetch-more button end': 'すべて取得しました',
  'magnetar table previous-next first-page button': '最初のページへ',
  'magnetar table previous-next last-page button': '最後のページへ',
  'magnetar table previous-next previous button': '前へ',
  'magnetar table previous-next next button': '次へ',
  'magnetar table previous-next end': 'すべて取得しました',
}

const parseLabel: MUIParseLabel<Label> = (label) => {
  if (Array.isArray(label)) {
    const key = label[0]
    const dic = { th_label: 'Title' }
    return dic[key]
  }

  return magnetarLabelDic[label] || label
}

const columns: MUIColumn<Item, Label>[] = [
  {
    buttons: [
      {
        label: 'Edit',
        handler: ({ data }) => alert(`edit ${data.id} (you have to implement this yourself)`),
      },
      {
        label: ({ isExpanded }) => (isExpanded ? 'Hide details' : 'Show details'),
        handler: ({ isExpanded }) => {
          isExpanded.value = !isExpanded.value
        },
      },
    ],
  },
  {
    fieldPath: 'id',
    buttons: [
      {
        label: 'Copy',
        handler: ({ value }) => alert(`copied to clipboard ${value}`),
        disabled: ({ data }) => (data.isDone ? undefined : true),
      },
    ],
  },
  {
    label: ['th_label'],
    fieldPath: 'title',
    sortable: { clearOtherOrderBy: true },
  },
  {
    label: 'Custom Slot',
    slot: 'nakashima',
    fieldPath: 'title',
  },
  {
    label: 'random pokemon name',
    fetchValue: async () => {
      const nr = roll(1, 151)
      const pokemon = await dbPokedex.doc(`${nr}`).fetch()
      return pokemon?.name || '...'
    },
  },
  {
    label: 'Is it done?',
    fieldPath: 'isDone',
    parseValue: ({ value }) => (value ? '✅' : '❌'),
    sortable: { clearOtherOrderBy: true, orderBy: 'asc', position: 0 },
  },
  {
    label: 'Is it done? (clickable)',
    buttons: [
      {
        style: 'all: unset',
        label: ({ data }) => (data.isDone ? '✅' : '❌'),
        handler: async ({ data }) => {
          await itemsModuleT.doc(data.id).merge({ isDone: !data.isDone })
        },
      },
    ],
  },
]

const urlParams = new URLSearchParams(window.location.search)
const sValue = urlParams.get('s') || undefined

const filters: MUIFilter<Item>[] = [
  {
    label: 'Search',
    placeholder: 'search something...',
    type: 'text',
    query: {
      or: [
        ['title', '==', (userInput) => userInput.trim()],
        ['id', '==', (userInput) => userInput.trim()],
      ],
    },
    clearOtherFilters: true,
    clearOrderBy: true,
    initialValue: sValue,
  },
  {
    label: 'Done or not',
    type: 'checkboxes',
    options: [
      { label: 'done', where: ['isDone', '==', true] },
      { label: 'not done', where: ['isDone', '==', false] },
    ],
  },
  {
    label: 'Titles starting with...',
    type: 'radio',
    options: [
      { label: 'a', where: ['title', '>', 'a'], checked: true },
      { label: 'f', where: ['title', '>', 'f'] },
      { label: 'k', where: ['title', '>', 'k'] },
      { label: 'p', where: ['title', '>', 'p'] },
      { label: 'u', where: ['title', '>', 'u'] },
    ],
  },
  {
    label: 'Titles starting with...',
    type: 'select',
    options: [
      { label: 'A', where: ['title', '>', 'A'] },
      { label: 'F', where: ['title', '>', 'F'] },
      { label: 'K', where: ['title', '>', 'K'] },
      { label: 'P', where: ['title', '>', 'P'] },
      { label: 'U', where: ['title', '>', 'U'] },
    ],
  },
]

const charts: MUIChart<Item, Label>[] = [
  {
    label: 'Done or not',
    type: 'doughnut',
    datasets: [
      { label: 'done', where: ['isDone', '==', true] },
      { label: 'not done', where: ['isDone', '==', false] },
    ],
  },
]

const showingCharts = ref(false)
const searchQuery = ref('')
const filterDataFn = computed<undefined | ((data: Record<string, any>, index: number) => boolean)>(
  () => {
    if (!searchQuery.value) return undefined
    return (data: Record<string, any>, index: number): boolean => {
      const regex = new RegExp(searchQuery.value, 'i')
      return regex.test(JSON.stringify(data))
    }
  }
)

const magnetarTableInstance = ref<null | InstanceType<typeof MagnetarTable>>(null)
</script>

<template>
  <div class="test">
    <label>
      <span>Show charts </span>
      <input v-model="showingCharts" type="checkbox" />
    </label>
    <div v-if="showingCharts">
      <h6>Charts</h6>
      <MagnetarChartDoughnut
        v-for="chart of charts"
        :chart="chart"
        :collection="itemsModuleT"
        :parseLabel="parseLabel"
      />
    </div>
    <!-- <h6>plugin-vue3 + plugin-firestore Magnetar Table</h6> -->

    <hr />

    <template v-if="magnetarTableInstance">
      <button
        v-if="magnetarTableInstance.fetchState !== 'end'"
        :disabled="magnetarTableInstance.fetchState !== 'ok'"
        kind="sub"
        @click="() => magnetarTableInstance?.fetchAll()"
      >
        {{
          magnetarTableInstance.fetchState === 'loading'
            ? 'fetching...'
            : `fetch all ${magnetarTableInstance.activeCollection.count} records`
        }}
      </button>
      <input
        v-if="magnetarTableInstance.fetchState === 'end'"
        v-model="searchQuery"
        type="search"
        placeholder="Search..."
      />
    </template>

    <hr />

    <MagnetarTable
      ref="magnetarTableInstance"
      class="magnetar-table"
      :collection="itemsModuleT"
      :columns="columns"
      :filters="filters"
      :pagination="{ fetchSize: 20, pageSize: 10 }"
      :parseLabel="parseLabel"
      :filterDataFn="filterDataFn"
      :rowMeta="{
        style: ({ data }) =>
          data.isDone ? 'background-color: lightgreen; opacity: 0.5' : undefined,
      }"
    >
      <template #nakashima="{ data, isExpanded, value }: MUITableSlot<Item>">
        {{ value?.slice(0, 1) + '...' }}
        <button @click="() => (isExpanded.value = !isExpanded.value)">
          {{ isExpanded.value ? 'Hide Details' : 'Show Details' }}
        </button>
      </template>

      <template #expansion="{ data, isExpanded }">
        <pre>{{ data }}</pre>
        <button @click="() => (isExpanded.value = !isExpanded.value)">Hide</button>
      </template>
    </MagnetarTable>
  </div>
</template>

<style lang="sass">
.magnetar-table
  table
    display: block
    border-collapse: collapse
    overflow-x: auto
  tr
    border-top: 1px solid #dfe2e5
  tr:nth-child(2n)
    background-color: #f6f8fa
  tr.magnetar-expansion
    background-color: goldenrod
    color: white
  th,
  td
    border: 1px solid #dfe2e5
    padding: 0.6em 1em
    white-space: nowrap
    > div
      display: flex
      align-items: center
      justify-content: center
      > button
        margin-left: auto
</style>
