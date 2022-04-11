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
      text-decoration: line-through
  ._item-new
    margin-top: 1rem
    input
      margin-right: 0.5rem
</style>

<script>
// type Item = { title: string; id: string; isDone: boolean }

export default {
  name: 'TodoApp',
  props: {
    /**
     * @type {PropType<Item[]>}
     */
    items: { type: Array, default: () => [] },
  },
  data() {
    return {
      newItem: '',
      editingTitle: '',
      editingIndex: -1,
    }
  },
  methods: {
    addItem() {
      const payload = { title: this.newItem, isDone: false, id: `${Math.random()}` }
      this.$emit('add', payload)
      this.newItem = ''
    },
    editItem(i) {
      const original = this.items[i]
      this.editingTitle = original.title
      this.editingIndex = i
    },
    saveEdits() {
      const title = this.editingTitle
      const item = this.items[this.editingIndex]
      const payload = { ...item, title }
      this.editingIndex = -1
      this.editingTitle = ''
      this.$emit('edit', payload)
    },
    deleteItem(item) {
      this.$emit('delete', item)
    },
    toggleItemDone(item) {
      const payload = { ...item, isDone: !item.isDone }
      this.$emit('edit', payload)
    },
  },
}
</script>
