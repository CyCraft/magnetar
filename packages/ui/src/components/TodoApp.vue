<script setup lang="ts">
import { ref } from 'vue'

type Item = { title: string; id: string; isDone: boolean }

const props = defineProps<{
  items: Item[]
}>()

const emit = defineEmits<{
  (e: 'add', payload: Item): void
  (e: 'edit', payload: Item): void
  (e: 'delete', payload: Item): void
  (e: 'edit', payload: Item): void
}>()

const newItem = ref('')
function addItem() {
  const payload: Item = { title: newItem.value, isDone: false, id: '' }
  emit('add', payload)
  newItem.value = ''
}

const editingIndex = ref(-1)
const editingTitle = ref('')
function editItem(i: number) {
  const original = props.items[i]
  editingTitle.value = original.title
  editingIndex.value = i
}
function saveEdits() {
  const title = editingTitle.value
  const item = props.items[editingIndex.value]
  const payload = { ...item, title }
  editingIndex.value = -1
  editingTitle.value = ''
  emit('edit', payload)
}

function deleteItem(item: Item) {
  emit('delete', item)
}

function toggleItemDone(item: Item) {
  const payload = { ...item, isDone: !item.isDone }
  emit('edit', payload)
}
</script>

<template>
  <div class="todo-app">
    <div
      v-for="(item, i) in items"
      :key="item.id"
      class="_item"
      :class="item.isDone ? '_is-done' : ''"
    >
      <button class="_done" @click="() => toggleItemDone(item)">
        {{ item.isDone ? '☑️' : '◻️' }}
      </button>

      <div v-if="editingIndex !== i" @dblclick="() => editItem(i)">{{ item.title }}</div>
      <input
        v-if="editingIndex === i"
        v-model="editingTitle"
        type="text"
        @keydown.enter="() => saveEdits()"
      />

      <button v-if="editingIndex === i" @click="() => saveEdits()">✅</button>
      <button v-if="editingIndex !== i" @click="() => editItem(i)">✏️</button>
      <button v-if="editingIndex !== i" @click="() => deleteItem(item)">❌</button>
    </div>
    <div class="_item-new">
      <input v-model="newItem" type="text" @keydown.enter="() => addItem()" />
      <button @click="() => addItem()">➕</button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.todo-app
  // background: black
  // @media (prefers-color-scheme: light)
  background: #f7f7f7
  padding: 1rem
  border-radius: 1rem
  margin: 0 1rem
  button
    border-radius: 0.3rem
    border: none
    padding: 0.3rem
    display: flex
    justify-content: center
    align-items: center
    cursor: pointer
    &._done
      background: none
      font-size: 1.5rem
      padding: 0
      outline: none
  input
    padding: 0.5rem
    border: none
  ._item, ._item-new
    display: flex
    align-items: center
    > *
      margin: 0.5rem
  ._item
    border-bottom: thin solid lightgrey
    &._is-done > div
      opacity: 0.6
      text-decoration: line-through
  ._item-new
    margin-top: 1rem
    input
      margin-right: 0.5rem
</style>
