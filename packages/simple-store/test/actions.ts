import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, charmander, squirtle, flareon } from './helpers/pokemon'
import { waitMs } from './helpers/wait'
import { DocInstance } from '@vue-sync/core'

test('write: insert (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const insertPayload = squirtle
  t.deepEqual(pokedexModule.data.get('007'), undefined)
  await pokedexModule.doc('007').insert(insertPayload).catch(e => t.fail(e.message)) // prettier-ignore
  t.deepEqual(pokedexModule.doc('007').data, insertPayload)
  t.deepEqual(pokedexModule.data.get('007'), insertPayload)
  t.deepEqual(vueSync.doc('pokedex/007').data, insertPayload)
  t.deepEqual(vueSync.collection('pokedex').doc('007').data, insertPayload)
})

test('write: insert (collection) → random ID', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const insertPayload = squirtle

  let moduleFromResult: DocInstance
  try {
    moduleFromResult = await pokedexModule.insert(insertPayload)
  } catch (error) {
    t.fail(error)
  }
  const newId = moduleFromResult.id
  const moduleFromLookup = vueSync.doc(`pokedex/${newId}`)
  const pokedexModuleLookup = vueSync.collection('pokedex')
  const moduleFromLookup2 = pokedexModuleLookup.doc(newId)
  const moduleFromLookup3 = pokedexModule.doc(newId)
  t.deepEqual(moduleFromResult.data, insertPayload)
  t.deepEqual(moduleFromResult.data, moduleFromLookup.data)
  t.deepEqual(moduleFromResult.data, moduleFromLookup2.data)
  t.deepEqual(moduleFromResult.data, moduleFromLookup3.data)
  t.deepEqual(pokedexModule.data.get(newId), insertPayload)
})

test('deleteProp: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  const deletePayload = 'age'
  const vueSyncDoc = vueSync.doc('data/trainer') // prettier-ignore
  const vueSyncCollectionDoc = vueSync.collection('data').doc('trainer') // prettier-ignore
  const vueSyncCollectionData = vueSync.collection('data').data // prettier-ignore
  t.deepEqual(trainerModule.data.age, 10)

  try {
    const result = await trainerModule.deleteProp(deletePayload)
    t.deepEqual(result.data, trainerModule.data)
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data.age, undefined)
  t.deepEqual(vueSyncDoc.data.age, undefined)
  t.deepEqual(vueSyncCollectionDoc.data.age, undefined)
  t.deepEqual(vueSyncCollectionData.get('trainer').age, undefined)
})

test('delete: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  const vueSyncCollectionDoc = vueSync.collection('data').doc('trainer')
  const vueSyncDoc = vueSync.doc('data/trainer')
  const vueSyncCollection = vueSync.collection('data')

  try {
    const result = await trainerModule.delete()
    t.deepEqual(result.data, undefined)
    t.deepEqual(result.id, trainerModule.id)
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(vueSyncCollection.data.get('trainer'), undefined)
  t.deepEqual(vueSyncCollectionDoc.data, undefined)
  t.deepEqual(vueSyncDoc.data, undefined)
  t.deepEqual(trainerModule.data, undefined)
  t.deepEqual(vueSync.collection('data').doc('trainer').data, undefined)
  t.deepEqual(vueSync.doc('data/trainer').data, undefined)
  t.deepEqual(vueSync.collection('data').data.get('trainer'), undefined)
})

test('write: merge (document)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const mergePayload = { id: '001', type: { alt: 'Leaf' } }
  const doc = pokedexModule.doc('001')
  t.deepEqual(doc.data, bulbasaur)
  await doc.merge(mergePayload).catch(e => t.fail(e.message)) // prettier-ignore
  const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data.get('001'), mergedResult)
  t.deepEqual(doc.data, mergedResult)
})

test('read: stream (collection)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
  t.deepEqual(pokedexModule.data.size, 1)
  const streamPayload = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(streamPayload).catch(e => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const unsubscribe = pokedexModule.openStreams[JSON.stringify(streamPayload)]
  unsubscribe()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
  t.deepEqual(pokedexModule.data.get('136'), flareon)
  t.deepEqual(pokedexModule.data.size, 2)
  await waitMs(1000)
  t.deepEqual(pokedexModule.data.size, 2)
  // '004': charmander should come in 3rd, but doesn't because we closed the stream
})

test('read: stream (doc)', async t => {
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  const streamPayload = {}
  // do not await, because it only resolves when the stream is closed
  trainerModule.stream(streamPayload).catch(e => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const unsubscribe = trainerModule.openStreams[JSON.stringify(streamPayload)]
  unsubscribe()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('read: get (collection)', async t => {
  // 'get' resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
  t.deepEqual(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.get(
      {},
      {
        on: {
          success: ({ result, storeName }) => {
            if (storeName === 'local') {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
            }
          },
        },
      }
    )
    t.deepEqual(result.data.get('001'), bulbasaur)
    t.deepEqual(result.data.get('136'), flareon)
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(pokedexModule.data.get('001'), bulbasaur)
  t.deepEqual(pokedexModule.data.get('136'), flareon)
  t.deepEqual(pokedexModule.data.size, 2)
})

test('read: get (document)', async t => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    const result = await trainerModule.get(
      {},
      {
        on: {
          success: ({ result, storeName }) => {
            if (storeName === 'local') {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
            }
          },
        },
      }
    )
    t.deepEqual(result.data, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
