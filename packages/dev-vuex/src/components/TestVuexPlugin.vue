<template>
  <div class="test">
    <h6>plugin-vue2 Todo list ({{ size }})</h6>
    <div>
      <label for="all">show done items</label>
      <input type="checkbox" name="" v-model="showAll" id="all" />
      <label for="order" style="padding-left: 1rem">alphabetically</label>
      <input type="checkbox" name="" v-model="alphabetically" id="order" />
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

const itemsModule = magnetar.collection('items', {
  configPerStore: {
    local: {
      getters: {
        doneItems(state) {
          return Object.values(state).filter((i) => i.isDone)
        },
      },
    },
  },
})
window.itemsModule = itemsModule

export default {
  components: { TodoApp },
  props: {},
  data() {
    return { showAll: true, alphabetically: false }
  },
  computed: {
    size() {
      return itemsModule.data.size
    },
    items() {
      const { showAll, alphabetically } = this
      const _module =
        showAll && alphabetically
          ? itemsModule.orderBy('title')
          : showAll && !alphabetically
          ? itemsModule
          : !showAll && alphabetically
          ? itemsModule.where('isDone', '==', false).orderBy('title')
          : itemsModule.where('isDone', '==', false)
      return _module.data.values()
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
