<template>
  <div class="test">
    <h6>plugin-vue3 Todo list ({{ size }})</h6>
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
    const showAll = ref(true)
    const alphabetically = ref(false)

    const size = computed(() => itemsModule.data.size)
    const items = computed(() => {
      const _showAll = showAll.value
      const _alphabetically = alphabetically.value
      const _module =
        _showAll && _alphabetically
          ? itemsModule.orderBy('title')
          : _showAll && !_alphabetically
          ? itemsModule
          : !_showAll && _alphabetically
          ? itemsModule.where('isDone', '==', false).orderBy('title')
          : itemsModule.where('isDone', '==', false)
      return [..._module.data.values()]
    })

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

    return { size, items, addItem, editItem, deleteItem, showAll, alphabetically }
  },
})
</script>
