<script setup lang="ts">
import { PokedexEntry } from '@magnetarjs/test-utils'
import type { WhereClause } from '@magnetarjs/types'
import { roll } from 'roll-anything'
import { ref, watch } from 'vue'
import {
  FiltersState,
  FilterStateCheckboxes,
  FilterStateOption,
  MagnetarTable,
  MUIColumn,
  MUIParseLabel,
  MUITableSlot,
} from '../src/index'
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
    sortable: { clearOtherOrderBy: true, orderBy: 'asc', position: 0 },
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
    sortable: { clearOtherOrderBy: true },
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

/**
 * This is the combined filters state you need to v-model onto MagnetarTable
 */
const filtersState = ref<FiltersState>(new Map())

const searchInput = ref<string>(sValue || '')
const checkboxesInput = ref<FilterStateCheckboxes>({ or: [] })
const selectInput = ref<FilterStateOption | null>(null)

// you need any fixed index to be able to save your local filter state to the `filtersState` Map.
const INDEX_SEARCH = 0
const INDEX_CHECKBOXES = 1
const INDEX_SELECT = 2

watch(
  searchInput,
  (newValue) => {
    if (!newValue) filtersState.value.delete(INDEX_SEARCH)
    if (newValue) {
      /** Set it just like checkboxes */
      const filterState: FilterStateCheckboxes = {
        or: [
          ['title', '==', newValue.trim()],
          ['id', '==', newValue.trim()],
        ],
      }
      filtersState.value.set(INDEX_SEARCH, filterState)
    }
  },
  { immediate: true }
)
// prettier-ignore
watch(
  checkboxesInput,
  (newValue) => {
    if (newValue.or.length) {
      filtersState.value.set(INDEX_CHECKBOXES, newValue)
    } else {
      filtersState.value.delete(INDEX_CHECKBOXES)
    }
  },
  { deep: true }
)
watch(selectInput, (newValue) => {
  if (newValue) {
    filtersState.value.set(INDEX_SELECT, newValue)
  } else {
    filtersState.value.delete(INDEX_SELECT)
  }
})

const optionsCheckboxes: { label: string; where: WhereClause }[] = [
  { label: 'done', where: ['isDone', '==', true] },
  { label: 'not done', where: ['isDone', '==', false] },
  { label: 'id is 7xmxyIhKeXg1DFY7uS9m', where: ['id', '==', '7xmxyIhKeXg1DFY7uS9m'] },
]

const optionsSelect: { label: string; where: WhereClause }[] = [
  { label: 'a', where: ['title', '>', 'a'] },
  { label: 'f', where: ['title', '>', 'f'] },
  { label: 'k', where: ['title', '>', 'k'] },
  { label: 'p', where: ['title', '>', 'p'] },
  { label: 'u', where: ['title', '>', 'u'] },
]
</script>

<template>
  <div class="test">
    <h4>Table Manual Filters</h4>
    <div style="margin: 2rem; display: flex; gap: 1rem">
      <fieldset>
        <legend>Search</legend>
        <input type="search" v-model="searchInput" />
      </fieldset>

      <fieldset>
        <legend>Done or not</legend>
        <span v-for="option in optionsCheckboxes" :key="option.label">
          <label>
            <input
              type="checkbox"
              :checked="
                !!checkboxesInput.or.find((o) => JSON.stringify(o) === JSON.stringify(option.where))
              "
              @change="(e) => {
                const checked = (e.target as HTMLInputElement)?.checked || false
                const existingIndex = checkboxesInput.or.findIndex(o => JSON.stringify(o) === JSON.stringify(option.where))
                if (checked && existingIndex === -1) checkboxesInput.or.push(option.where)
                if (!checked && existingIndex !== -1) checkboxesInput.or.splice(existingIndex, 1)
              }"
            />
            {{ option.label }}
          </label>
        </span>
      </fieldset>

      <fieldset>
        <legend>Titles starting with...</legend>
        <select v-model="selectInput">
          <option>--</option>
          <option v-for="option in optionsSelect" :key="option.label" :value="option.where">
            {{ option.label }}
          </option>
        </select>
      </fieldset>
    </div>

    <hr />

    <MagnetarTable
      v-model:filtersState="filtersState"
      class="magnetar-table"
      :collection="itemsModuleT"
      :columns="columns"
      :filters="[]"
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
