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
  name: 'TestSimpleStorePlugin',
  components: { TodoApp },
  props: {},
  data() {
    return { data: itemsModule.data }
  },
  computed: {
    items() {
      return [...this.data.values()]
    },
  },
  methods: {
    addNew(newItem) {
      itemsModule.insert(newItem)
    },
  },
}
</script>
