<script setup lang="ts">
import { PokedexEntry } from '@magnetarjs/test-utils'
import { roll } from 'roll-anything'
import { MagnetarTable, MUIColumn, MUIFilter, MUIParseLabel, MUITableSlot } from '../src/index'
import { magnetar } from './magnetar'

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
</script>

<template>
  <div class="test">
    <!-- <h6>plugin-vue3 + plugin-firestore Magnetar Table</h6> -->

    <MagnetarTable
      class="magnetar-table"
      :collection="itemsModuleT"
      :columns="columns"
      :filters="filters"
      :pagination="{ limit: 10, kind: 'previous-next' }"
      :parseLabel="parseLabel"
    >
      <template #nakashima="{ data, isExpanded }: MUITableSlot<Item>">
        {{ Object.keys(data).join('、') }}
        <button @click="() => (isExpanded.value = !isExpanded.value)">
          {{ isExpanded.value ? 'Hide' : 'Show' }}
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
