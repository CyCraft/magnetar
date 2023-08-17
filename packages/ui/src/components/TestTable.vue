<script setup lang="ts">
import { magnetar } from '../magnetar'
import { MUIColumn, MUIFilter } from '../types'
import MagnetarTable from './MagnetarTable.vue'

type Item = { title: string; id: string; isDone: boolean }

const itemsModuleT = magnetar.collection<Item>('magnetarTests/dev-firestore/itemsF')

// @ts-ignore — added to window to be able to play around in the console
window.itemsModuleT = itemsModuleT

const columns: MUIColumn<Item>[] = [
  {
    buttons: [
      {
        label: 'Edit',
        handler: ({ data }) => alert(`edit ${data.id} (you have to implement this yourself)`),
      },
    ],
  },
  {
    fieldPath: 'id',
    buttons: [{ label: 'Copy', handler: ({ value }) => alert(`copied to clipboard ${value}`) }],
  },
  {
    label: 'Title',
    fieldPath: 'title',
    sortable: { orderBy: 'asc', position: 0 },
  },
  {
    label: 'Custom Slot',
    slot: 'somecolumn',
  },
  {
    label: 'Is it done?',
    fieldPath: 'isDone',
    parseValue: ({ value }) => (value ? '✅' : '❌'),
    sortable: true,
  },
]

const filters: MUIFilter<Item>[] = [
  {
    label: 'Search',
    placeholder: 'search something...',
    type: 'text',
    where: {
      or: [
        ['title', '==', (userInput) => userInput.trim()],
        ['id', '==', (userInput) => userInput.trim()],
      ],
    },
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
      { label: 'a', where: ['title', '>', 'a'] },
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

const urlParams = new URLSearchParams(window.location.search)
const sValue = urlParams.get('s')
const filterState = sValue ? new Map([[0, sValue]]) : undefined
</script>

<template>
  <div class="test">
    <h6>plugin-vue3 + plugin-firestore Magnetar Table</h6>

    <MagnetarTable
      class="magnetar-table"
      :collection="itemsModuleT"
      :columns="columns"
      :filters="filters"
      :pagination="{ limit: 10 }"
      :filtersState="filterState"
    >
      <template #somecolumn="{ data }">
        <pre>{{ data }}</pre>
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
