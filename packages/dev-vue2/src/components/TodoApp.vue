<template>
  <div class="todo-app">
    <div class="_item" v-for="(item, i) in items" :key="i">
      <div @dblclick="editItem(i)" v-if="editingIndex !== i">{{ item.title }}</div>
      <input
        type="text"
        @keydown.enter="saveEdits"
        v-if="editingIndex === i"
        v-model="editingTitle"
      />

      <button @click="saveEdits" v-if="editingIndex === i">✅</button>
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
  ._item-new
    margin-top: 1rem
    input
      margin-right: 0.5rem
</style>

<script>
// type Item = { title: string; id: string }

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
      const payload = { title: this.newItem, id: `${Math.random()}` }
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
      const { id } = this.items[this.editingIndex]
      const payload = { title, id }
      this.editingIndex = -1
      this.editingTitle = ''
      this.$emit('edit', payload)
    },
    deleteItem(item) {
      this.$emit('delete', item)
    },
  },
}
</script>
