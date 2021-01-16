<template>
  <div class="test">
    <h6>plugin-vue2 Todo list ({{ size }})</h6>
    <div>
      <label for="odi">show done items</label>
      <input type="checkbox" name="" v-model="showDoneItems" id="odi" />
    </div>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script>
import { magnetar } from '../magnetar.js'
import TodoApp from './TodoApp.vue'

// type Item = { title: string; id: string }

const itemsModule = magnetar.collection('items')
window.itemsModule = itemsModule

export default {
  components: { TodoApp },
  props: {},
  data() {
    return { showDoneItems: true }
  },
  computed: {
    size() {
      return itemsModule.data.size
    },
    items() {
      return this.showDoneItems
        ? itemsModule.data.values()
        : itemsModule.where('isDone', '==', false).data.values()
    },
  },
  methods: {
    addItem(item = { title: '', id: '' }) {
      console.log(`add item → `, item)
      itemsModule.insert(item)
    },
    editItem(item = { title: '', id: '' }) {
      console.log(`edit item → `, item)
      itemsModule.doc(item.id).merge(item)
    },
    deleteItem(item = { title: '', id: '' }) {
      console.log(`delete item → `, item)
      itemsModule.delete(item.id)
    },
  },
}
</script>
