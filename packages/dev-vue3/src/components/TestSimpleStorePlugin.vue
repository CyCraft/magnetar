<template>
  <div class="test">
    <h6>simple store doesn't work:</h6>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
    
    <h6>quick playground integration:</h6>
    <TodoApp @add="addItemManual" :items="itemsManual" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import { reactive, computed, defineComponent } from 'vue'
import { magnetar } from '../magnetarSimpleStore'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string; isDone: boolean }

const itemsModule = magnetar.collection<Item>('items')
const itemsModuleManual = {
  data: reactive(new Map()),
  insert(item: any) {
    this.data.set(`${Math.random()}`, item)
  },
}

export default defineComponent({
  components: { TodoApp },
  props: {},
  setup() {
    const items = computed(() => [...itemsModule.data.values()])
    const itemsManual = computed(() => [...itemsModuleManual.data.values()])

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

    function addItemManual(item: Item) {
      console.log(`add item manual → `, item)
      itemsModuleManual.insert(item)
    }

    return { items, addItem, editItem, deleteItem, itemsManual, addItemManual }
  },
})
</script>
