<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount, onMounted } from 'vue'
import {
  collection,
  onSnapshot,
  query,
  QuerySnapshot,
  DocumentChange,
  doc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../initFirebase.js'
import TodoApp from './TodoApp.vue'

type Item = { title: string; id: string; isDone: boolean }

function defaultsItem(payload: Partial<Item>): Item {
  return { title: '', id: '', isDone: false, ...payload }
}

// Use the same structure as plugin-vue3: reactive Map
const data: { [collectionPath: string]: Map<string, { [key: string]: unknown }> } = {}
const collectionPath = 'magnetarTests/dev-firestore/items'
const itemsMap = reactive(new Map<string, { [key: string]: unknown }>())
data[collectionPath] = itemsMap

/** Item count */
const size = computed(() => itemsMap.size)

/** Options to filter items */
const showAll = ref(true)
const alphabetically = ref(false)

/** The items shown based on the filter - same pattern as TestFirestorePluginStream */
const items = computed<Item[]>(() => {
  console.log(`items running`)
  const _showAll = showAll.value
  const _alphabetically = alphabetically.value

  let filteredItems = Array.from(itemsMap.values()) as Item[]

  if (!_showAll) {
    filteredItems = filteredItems.filter((item) => !item.isDone)
  }

  if (_alphabetically) {
    filteredItems = [...filteredItems].sort((a, b) => a.title.localeCompare(b.title))
  }

  return filteredItems
})

let unsubscribe: (() => void) | null = null

onMounted(() => {
  const collectionRef = collection(db, collectionPath)
  const q = query(collectionRef)

  // Pool querySnapshots that arrive while waiting (like plugin-firestore does)
  const pendingSnapshots: QuerySnapshot[] = []
  let isProcessing = false

  const processDocChanges = (querySnapshot: QuerySnapshot) => {
    querySnapshot.docChanges().forEach((docChange: DocumentChange) => {
      const docData = docChange.doc.data()
      const docId = docChange.doc.id

      if (docChange.type === 'added' || docChange.type === 'modified') {
        // Mimic what insert does: set empty object, then assign properties
        itemsMap.set(docId, {})
        const docDataToMutate = itemsMap.get(docId)
        if (docDataToMutate) {
          Object.entries(defaultsItem({ ...docData, id: docId })).forEach(([key, value]) => {
            docDataToMutate[key] = value
          })
        }
      } else if (docChange.type === 'removed') {
        itemsMap.delete(docId)
      }
    })
  }

  unsubscribe = onSnapshot(
    q,
    async (querySnapshot: QuerySnapshot) => {
      console.log(
        `[${new Date().toISOString()}] onSnapshot callback fired with ${querySnapshot.docChanges().length} changes`,
      )
      // Add to pending pool
      pendingSnapshots.push(querySnapshot)

      // If already processing, let the current processor handle it
      if (isProcessing) return

      // Simulate write lock await (like plugin-firestore does)
      // This might cause Vue to flush updates before processing all changes
      isProcessing = true
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Process all pending snapshots synchronously (like plugin-firestore does)
      console.log(
        `[${new Date().toISOString()}] starting to process ${pendingSnapshots.length} snapshots`,
      )
      let snapshot = pendingSnapshots.shift()
      while (snapshot) {
        processDocChanges(snapshot)
        // Add heavy synchronous work between processing snapshots (to mimic Magnetar's extra processing)
        // This might cause Vue to flush updates between snapshots
        let heavyWork = 0
        for (let i = 0; i < 100_000_000; i++) {
          heavyWork += Math.sqrt(i) * Math.random()
        }
        snapshot = pendingSnapshots.shift()
      }

      isProcessing = false
    },
    (error) => {
      console.error('Stream error:', error)
    },
  )
})

onBeforeUnmount(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

function addItem(item: Item) {
  // Not implemented - just for compatibility with TodoApp
}

function editItem(item: Item) {
  // Not implemented - just for compatibility with TodoApp
}

function deleteItem(item: Item) {
  // Not implemented - just for compatibility with TodoApp
}

async function testModification() {
  const itemsToTest = items.value
  if (itemsToTest.length === 0) {
    console.warn('No items to test')
    return
  }

  console.log(`🧪 Testing ${itemsToTest.length} items - First loop`)
  // First loop: make local updates (optimistic) then prepare batch
  // In Magnetar, merges are called synchronously, added to stack, countdown starts async
  for (const item of itemsToTest) {
    const docData = itemsMap.get(item.id)
    if (docData) {
      ;(docData as any).title = item.title + '.'
    }
  }
  // Prepare first batch (mimicking how merges are added to the stack)
  const batch1 = writeBatch(db)
  for (const item of itemsToTest) {
    const docRef = doc(db, collectionPath, item.id)
    batch1.update(docRef, {
      title: item.title + '.',
    })
  }
  // In Magnetar, the countdown runs async and commits after 100ms
  // We wait 100ms then commit (mimicking the countdown finishing)
  const commit1 = new Promise<void>((resolve) => {
    setTimeout(async () => {
      await batch1.commit()
      resolve()
    }, 100)
  })

  // Wait 100ms (matching the test pattern - this happens while countdown is running)
  await new Promise((resolve) => setTimeout(resolve, 100))
  await commit1

  console.log(`🧪 Testing ${itemsToTest.length} items - Second loop`)
  // Second loop: make local updates (optimistic) then prepare batch
  for (const item of itemsToTest) {
    const docData = itemsMap.get(item.id)
    if (docData) {
      ;(docData as any).title = item.title + '..'
    }
  }
  // Prepare second batch (mimicking how merges are added to a new stack)
  const batch2 = writeBatch(db)
  for (const item of itemsToTest) {
    const docRef = doc(db, collectionPath, item.id)
    batch2.update(docRef, {
      title: item.title + '..',
    })
  }
  // In Magnetar, the countdown runs async and commits after 100ms
  const commit2 = new Promise<void>((resolve) => {
    setTimeout(async () => {
      await batch2.commit()
      resolve()
    }, 100)
  })

  // Wait 100ms (matching the test pattern - this happens while countdown is running)
  await new Promise((resolve) => setTimeout(resolve, 100))
  await commit2
}
</script>

<template>
  <div class="_test">
    <h6>Vanilla JS SDK Test ({{ size }} items)</h6>
    <div style="margin: 1rem">
      <label for="all">show done items</label>
      <input type="checkbox" name="" v-model="showAll" id="all" />
      <label for="order" style="padding-left: 1rem">alphabetically</label>
      <input type="checkbox" name="" v-model="alphabetically" id="order" />
    </div>
    <div style="margin: 1rem">
      <button @click="() => testModification()">test updating {{ items.length }} items</button>
    </div>
    <TodoApp @add="addItem" @edit="editItem" @delete="deleteItem" :items="items" />
  </div>
</template>
