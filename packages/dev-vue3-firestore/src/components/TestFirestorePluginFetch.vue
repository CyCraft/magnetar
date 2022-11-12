<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue'
import { magnetar, generateRandomId } from '../magnetar'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string; isDone: boolean }

const itemsModuleF = magnetar.collection<Item>('magnetarTests/dev-firestore/itemsF')

// @ts-ignore — added to window to be able to play around in the console
window.itemsModuleF = itemsModuleF

const query = itemsModuleF.orderBy('title', 'desc').limit(10)

async function fetchMore() {
  try {
    await query.startAfter(query.fetched.last).fetch({ force: true })
    if (query.fetched.reachedEnd) console.log(`that's all!`)
  } catch (error) {
    console.error(`fetchMore error:`, error)
  }
}

onBeforeMount(() => fetchMore())

/** Item count */
const size = computed(() => itemsModuleF.data.size)

/** Options to filter items */
const showAll = ref(true)
const alphabetically = ref(false)

/** The items shown based on the filter */
const items = computed(() => {
  const _showAll = showAll.value
  const _alphabetically = alphabetically.value

  let _module: typeof itemsModuleF = itemsModuleF

  if (_showAll && _alphabetically) {
    _module = itemsModuleF.orderBy('title')
  }
  if (!_showAll && _alphabetically) {
    _module = itemsModuleF.where('isDone', '==', false).orderBy('title')
  }
  if (!_showAll && !_alphabetically) {
    _module = itemsModuleF.where('isDone', '==', false)
  }

  return [..._module.data.values()]
})

function addItem(item: Item) {
  item.id = generateRandomId()
  console.log(`add item → `, item)
  itemsModuleF.insert(item)
}

function editItem(item: Item) {
  console.log(`edit item → `, item)
  itemsModuleF.doc(item.id).merge(item)
}

function deleteItem(item: Item) {
  console.log(`delete item → `, item)
  itemsModuleF.delete(item.id)
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
    <div style="margin: 1rem; cursor: pointer" @click="() => fetchMore()">fetch more</div>
    <div style="margin: 1rem">reached end: {{ query.fetched.reachedEnd }}</div>
  </div>
</template>
