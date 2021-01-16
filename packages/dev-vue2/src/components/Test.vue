<template>
  <div class="test">
    <h6>vue 2 store:</h6>
    <pre>{{ itemsModuleData }}</pre>
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
  computed: {
    itemsModuleData() {
      return itemsModule.data
    },
    items() {
      return []
      // return Object.values(itemsModule.data.raw)
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
