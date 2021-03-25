<template>
  <div class="todo-app">
    <div
      class="_item"
      :class="item.isDone ? '_is-done' : ''"
      v-for="(item, i) in items"
      :key="item.id"
    >
      <button @click="toggleItemDone(item)" class="_done">{{ item.isDone ? '☑️' : '◻️' }}</button>

      <div @dblclick="editItem(i)" v-if="editingIndex !== i">{{ item.title }}</div>
      <input
        type="text"
        @keydown.enter="saveEdits"
        v-if="editingIndex === i"
        v-model="editingTitle"
      />

      <button @click="saveEdits" v-if="editingIndex === i">✅</button>
      <button @click="editItem(i)" v-if="editingIndex !== i">✏️</button>
      <button @click="deleteItem(item)" v-if="editingIndex !== i">❌</button>
    </div>
    <div class="_item-new">
      <input type="text" @keydown.enter="addItem" v-model="newItem" />
      <button @click="addItem">➕</button>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.todo-app
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
  ._item-new
    margin-top: 1rem
    input
      margin-right: 0.5rem
</style>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'

type Item = { title: string; isDone: boolean; id: string }

export default defineComponent({
  name: 'TodoApp',
  props: {
    items: { type: Array as PropType<Item[]>, default: () => [] },
    generateRandomId: { type: Function as PropType<() => string>, required: true },
  },
  setup(props, { emit }) {
    const newItem = ref('')
    function addItem() {
      const payload: Item = { title: newItem.value, isDone: false, id: props.generateRandomId() }
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

    return {
      newItem,
      addItem,
      editItem,
      editingIndex,
      saveEdits,
      editingTitle,
      deleteItem,
      toggleItemDone,
    }
  },
})
</script>
