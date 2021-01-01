<template>
  <div class="test">
    <TodoApp @add="addNew" :items="items" />
  </div>
</template>

<style lang="sass" scoped>
// $

// .test
</style>

<script>
import { magnetar } from '../magnetar.js'
import TodoApp from './TodoApp.vue'

const itemsModule = magnetar.collection('items')
window.itemsModule = itemsModule

export default {
  name: 'Test',
  components: { TodoApp },
  props: {},
  computed: {
    items() {
      // return [...itemsModule.data.values()]
      return Object.values(itemsModule.data)
    },
  },
  methods: {
    addNew(newItem) {
      itemsModule.insert(newItem)
    },
  },
}
</script>
