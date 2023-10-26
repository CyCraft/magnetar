<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { generateRandomId, magnetar } from './magnetar'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string; isDone: boolean }

const itemsModule = magnetar.collection<Item>('magnetarTests/dev-firestore/items')

// @ts-ignore — added to window to be able to play around in the console
window.itemsModule = itemsModule

onBeforeMount(async () => {
  try {
    await itemsModule.stream()
  } catch (error) {
    console.error(`stream closed unexpectedly with error:`, error)
  }
})
onBeforeUnmount(() => {
  itemsModule.closeAllStreams()
})

/** Item count */
const size = computed(() => itemsModule.data.size)

/** Options to filter items */
const showAll = ref(true)
const alphabetically = ref(false)

/** The items shown based on the filter */
const items = computed<Item[]>(() => {
  const _showAll = showAll.value
  const _alphabetically = alphabetically.value

  let _module: typeof itemsModule = itemsModule

  if (_showAll && _alphabetically) {
    _module = itemsModule.orderBy('title')
  }
  if (!_showAll && _alphabetically) {
    _module = itemsModule.where('isDone', '==', false).orderBy('title')
  }
  if (!_showAll && !_alphabetically) {
    _module = itemsModule.where('isDone', '==', false)
  }

  return [..._module.data.values()]
})

function addItem(item: Item) {
  item.id = generateRandomId()
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
</script>

<template>
  <div class="test">
    <h6>plugin-vue3 + plugin-firestore Todo list ({{ size }})</h6>
    <div style="margin: 1rem">
      <label for="all">show done items</label>
      <input type="checkbox" name="" v-model="showAll" id="all" />
      <label for="order" style="padding-left: 1rem">alphabetically</label>
      <input type="checkbox" name="" v-model="alphabetically" id="order" />
    </div>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
  </div>
</template>
