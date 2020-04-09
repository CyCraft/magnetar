import test from 'ava'
import {
  createVueSyncInstance,
  PokedexModuleData,
  TrainerModuleData,
} from './helpers/createVueSyncInstance'
import { bulbasaur, charmander, squirtle, flareon } from './helpers/pokemon'
import { waitMs } from './helpers/wait'

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
  const moduleFromResult = await pokedexModule.insert(insertPayload).catch(e => t.fail(e.message)) // prettier-ignore
  // todo: why is moduleFromResult able to return void?
  if (!moduleFromResult) return t.fail()
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
  const { trainerModule } = createVueSyncInstance()
  const deletePayload = 'age'
  t.deepEqual(trainerModule.data.age, 10)
  const result = await trainerModule.deleteProp(deletePayload).catch(e => t.fail(e.message)) // prettier-ignore
  t.deepEqual(result, undefined)
  t.deepEqual(trainerModule.data.age, undefined)
})

test('only:delete: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  t.deepEqual(trainerModule.data.age, 10)
  const result = await trainerModule.delete().catch(e => t.fail(e.message)) // prettier-ignore
  t.deepEqual(result, undefined)
  t.deepEqual(trainerModule.data, undefined)
  t.deepEqual(vueSync.doc('data/trainer'), undefined)
})

test('write: merge (document)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const mergePayload = { id: '001', type: { alt: 'Leaf' } }
  const doc = pokedexModule.doc('001')
  t.deepEqual(doc.data, bulbasaur)
  await doc.merge(mergePayload).catch(e => t.fail(e.message)) // prettier-ignore
  const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data['001'], mergedResult)
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
            if (storeName === 'remote') {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(result, [bulbasaur, flareon])
            }
          },
        },
      }
    )
    t.deepEqual(result, [bulbasaur, flareon])
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
              t.deepEqual(result, undefined)
              t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
            }
          },
        },
      }
    )
    t.deepEqual(result, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
