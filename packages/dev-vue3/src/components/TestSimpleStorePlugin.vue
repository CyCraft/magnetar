<template>
  <div class="test">
    <TodoApp @add="addNew" :items="items" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import { reactive, computed, defineComponent } from 'vue'
import { magnetar } from '../magnetar'
import TodoApp from './TodoApp.vue'

const itemsModule = magnetar.collection('items')
// @ts-ignore
window.itemsModule = itemsModule

export default defineComponent({
  name: 'TestSimpleStorePlugin',
  components: { TodoApp },
  props: {},
  setup() {
    const itemsMap = reactive(itemsModule.data)
    const items = computed(() => [...itemsMap.values()])

    function addNew(newItem: any) {
      console.log(`newItem → `, newItem)
      itemsModule.insert(newItem)
    }

    return { items, addNew }
  },
})
</script>
