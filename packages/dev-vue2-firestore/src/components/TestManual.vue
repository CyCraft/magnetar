<template>
  <div class="test">
    <h6>manual implementation:</h6>
    <pre>{{ itemsModuleData }}</pre>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script>
import TodoApp from './TodoApp.vue'
import vue from 'vue'

const itemsModule = {
  collections: vue.observable({
    data: {},
  }),
  insert(item) {
    vue.set(this.collections.data, `${Math.random()}`, item)
  },
}

export default {
  components: { TodoApp },
  props: {},
  computed: {
    itemsModuleData() {
      return itemsModule.collections
    },
    items() {
      return Object.values(itemsModule.collections.data)
    },
  },
  methods: {
    addItem(item = { title: '', id: '' }) {
      console.log(`add item → `, item)
      itemsModule.insert(item)
    },
    editItem(item = { title: '', id: '' }) {
      console.log(`edit item → `, item)
      // itemsModule.doc(item.id).merge(item)
    },
    deleteItem(item = { title: '', id: '' }) {
      console.log(`delete item → `, item)
      // itemsModule.delete(item.id)
    },
  },
}
</script>
