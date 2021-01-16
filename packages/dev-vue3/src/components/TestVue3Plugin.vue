<template>
  <div class="test">
    <h6>vue 3 store:</h6>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import { reactive, computed, defineComponent } from 'vue'
import { magnetar } from '../magnetarVue3'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string }

const itemsModule = magnetar.collection<Item>('items')

export default defineComponent({
  name: 'TestSimpleStorePlugin',
  components: { TodoApp },
  props: {},
  setup() {
    const items = computed(() => [...itemsModule.data.values()])

    function addItem(item: Item) {
      console.log(`add item → `, item)
      itemsModule.insert(item)
    }

    function editItem(item: Item) {
      console.log(`edit item → `, item)
      itemsModule.doc(item.id).merge(item)
    }

    function deleteItem(item: Item) {
      console.log(`delete item → `, item)
      itemsModule.delete(item.id)
    }

    return { items, addItem, editItem, deleteItem }
  },
})
</script>
