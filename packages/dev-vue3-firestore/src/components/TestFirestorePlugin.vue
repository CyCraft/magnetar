<template>
  <div class="test">
    <h6>plugin-vue3 + plugin-firestore Todo list ({{ size }})</h6>
    <div>
      <label for="all">show done items</label>
      <input type="checkbox" name="" v-model="showAll" id="all" />
      <label for="order" style="padding-left: 1rem">alphabetically</label>
      <input type="checkbox" name="" v-model="alphabetically" id="order" />
    </div>
    <TodoApp
      @add="addItem"
      @edit="editItem"
      @delete="deleteItem"
      :items="items"
      :generateRandomId="generateRandomId"
    />
    <hr />
    <h6>Not Done</h6>
    <TodoApp
      @add="(item) => addItem(item, 'itemsModuleNotDone')"
      @edit="(item) => editItem(item, 'itemsModuleNotDone')"
      @delete="(item) => deleteItem(item, 'itemsModuleNotDone')"
      :items="itemsNotDone"
      :generateRandomId="generateRandomId"
    />
    <hr />
    <h6>Done</h6>
    <TodoApp
      @add="(item) => addItem(item, 'itemsModuleDone')"
      @edit="(item) => editItem(item, 'itemsModuleDone')"
      @delete="(item) => deleteItem(item, 'itemsModuleDone')"
      :items="itemsDone"
      :generateRandomId="generateRandomId"
    />
  </div>
</template>

<style lang="sass" scoped>
</style>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { magnetar, generateRandomId } from '../magnetar'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string }

const itemsModule = magnetar.collection<Item>('magnetarTests/dev-firestore/items')
const itemsModuleDone = magnetar
  .collection<Item>('magnetarTests/dev-firestore/items', { queryBasedCache: true })
  .where('isDone', '==', true)
const itemsModuleNotDone = magnetar
  .collection<Item>('magnetarTests/dev-firestore/items', { queryBasedCache: true })
  .where('isDone', '==', false)

// @ts-ignore
window.itemsModule = itemsModule
// @ts-ignore
window.itemsModuleDone = itemsModuleDone
// @ts-ignore
window.itemsModuleNotDone = itemsModuleNotDone

export default defineComponent({
  components: { TodoApp },
  props: {},
  created() {
    itemsModule.stream()
    itemsModuleDone.stream()
    itemsModuleNotDone.stream()
  },
  setup() {
    const showAll = ref(true)
    const alphabetically = ref(false)

    const size = computed(() => itemsModule.data.size)
    const items = computed(() => {
      const _showAll = showAll.value
      const _alphabetically = alphabetically.value
      let _module: any
      if (_showAll && _alphabetically) _module = itemsModule.orderBy('title')
      if (_showAll && !_alphabetically) _module = itemsModule
      if (!_showAll && _alphabetically)
        _module = itemsModule.where('isDone', '==', false).orderBy('title')
      if (!_showAll && !_alphabetically) _module = itemsModule.where('isDone', '==', false)
      return [..._module.data.values()]
    })

    function addItem(item: Item, target?: string) {
      console.log(`add item → `, item)
      if (target === 'itemsModuleNotDone') itemsModuleNotDone.insert(item)
      if (target === 'itemsModuleDone') itemsModuleDone.insert(item)
      if (!target) itemsModule.insert(item)
    }

    function editItem(item: Item, target?: string) {
      console.log(`edit item → `, item)
      if (target === 'itemsModuleNotDone') itemsModuleNotDone.doc(item.id).merge(item)
      if (target === 'itemsModuleDone') itemsModuleDone.doc(item.id).merge(item)
      if (!target) itemsModule.doc(item.id).merge(item)
    }

    function deleteItem(item: Item, target?: string) {
      console.log(`delete item → `, item)
      if (target === 'itemsModuleNotDone') itemsModuleNotDone.delete(item.id)
      if (target === 'itemsModuleDone') itemsModuleDone.delete(item.id)
      if (!target) itemsModule.delete(item.id)
    }

    const itemsDone = computed(() => [...itemsModuleDone.data.values()])
    const itemsNotDone = computed(() => [...itemsModuleNotDone.data.values()])

    return {
      size,
      items,
      itemsDone,
      itemsNotDone,
      addItem,
      editItem,
      deleteItem,
      showAll,
      alphabetically,
      generateRandomId,
    }
  },
})
</script>
