<template>
  <div class="test">
    <h6>plugin-vue3 Todo list ({{ size }})</h6>
    <div>
      <label for="odi">show done items</label>
      <input type="checkbox" name="" v-model="showDoneItems" id="odi" />
    </div>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { magnetar } from '../magnetarVue3'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string }

const itemsModule = magnetar.collection<Item>('items')
const itemsModuleOnlyIncomplete = magnetar.collection<Item>('items').where('isDone', '==', false)

export default defineComponent({
  components: { TodoApp },
  props: {},
  setup() {
    const showDoneItems = ref(true)

    const size = computed(() => itemsModule.data.size)
    const items = computed(() =>
      showDoneItems.value
        ? [...itemsModule.data.values()]
        : [...itemsModuleOnlyIncomplete.data.values()]
    )

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

    return { size, items, addItem, editItem, deleteItem, showDoneItems }
  },
})
</script>
