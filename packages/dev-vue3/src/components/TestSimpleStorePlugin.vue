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
import { reactive, computed } from 'vue'
import { magnetar } from '../magnetar.js'
import TodoApp from './TodoApp.vue'

const itemsModule = magnetar.collection('items')
window.itemsModule = itemsModule

export default {
  name: 'TestSimpleStorePlugin',
  components: { TodoApp },
  props: {},
  setup() {
    const itemsMap = reactive(itemsModule.data)
    const items = computed(() => [...itemsMap.values()])

    function addNew(newItem) {
      itemsModule.insert(newItem)
    }

    return { items, addNew }
  },
}
</script>
