import test from 'ava'
import { DocInstance } from '../../src/index'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokemon'
import { waitMs } from '../helpers/wait'
import { merge } from 'merge-anything'

test('write: insert (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = pokedex(7)
  t.deepEqual(pokedexModule.data.get('7'), undefined)
  await pokedexModule.doc('7').insert(payload).catch(e => t.fail(e.message)) // prettier-ignore
  // check data of references executed on
  t.deepEqual(pokedexModule.data.get('7'), payload)
  // check data of new references
  t.deepEqual(pokedexModule.doc('7').data, payload)
  t.deepEqual(vueSync.doc('pokedex/7').data, payload)
  t.deepEqual(vueSync.collection('pokedex').doc('7').data, payload)
})

test('write: insert (collection) → random ID', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = pokedex(7)

  let moduleFromResult: DocInstance
  try {
    moduleFromResult = await pokedexModule.insert(payload)
  } catch (error) {
    t.fail(error)
  }
  const newId = moduleFromResult.id
  // check data of reference returned
  t.deepEqual(moduleFromResult.data, payload)
  // check data of references executed on
  t.deepEqual(pokedexModule.data.get(newId), payload)
  // check data of new references
  t.deepEqual(vueSync.doc(`pokedex/${newId}`).data, payload)
  t.deepEqual(vueSync.collection('pokedex').doc(newId).data, payload)
  t.deepEqual(pokedexModule.doc(newId).data, payload)
})

test('deleteProp: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  const payload = 'age'
  t.deepEqual(trainerModule.data.age, 10)

  // create references on beforehand
  const vueSyncDoc = vueSync.doc('data/trainer') // prettier-ignore
  const vueSyncCollectionDoc = vueSync.collection('data').doc('trainer') // prettier-ignore
  const vueSyncCollectionData = vueSync.collection('data').data // prettier-ignore

  try {
    const result = await trainerModule.deleteProp(payload)
    // check data of reference returned
    t.deepEqual(result.data, trainerModule.data)
  } catch (error) {
    t.fail(error)
  }
  // check data of references created on beforehand
  t.deepEqual(vueSyncDoc.data.age, undefined)
  t.deepEqual(vueSyncCollectionDoc.data.age, undefined)
  t.deepEqual(vueSyncCollectionData.get('trainer').age, undefined)
  // check data of references executed on
  t.deepEqual(trainerModule.data.age, undefined)
})

test('delete: (document)', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  // create references on beforehand
  const vueSyncCollection = vueSync.collection('data')
  const vueSyncCollectionDoc = vueSync.collection('data').doc('trainer')
  const vueSyncDoc = vueSync.doc('data/trainer')

  try {
    const result = await trainerModule.delete()
    // check data of reference returned
    t.deepEqual(result.data, undefined)
    t.deepEqual(result.id, trainerModule.id)
  } catch (error) {
    t.fail(error)
  }
  // check data of references created on beforehand
  t.deepEqual(vueSyncCollection.data.get('trainer'), undefined)
  t.deepEqual(vueSyncCollectionDoc.data, undefined)
  t.deepEqual(vueSyncDoc.data, undefined)
  // check data of references executed on
  t.deepEqual(trainerModule.data, undefined)
  // check data of new references
  t.deepEqual(vueSync.collection('data').doc('trainer').data, undefined)
  t.deepEqual(vueSync.doc('data/trainer').data, undefined)
  t.deepEqual(vueSync.collection('data').data.get('trainer'), undefined)
})

test('write: merge (document)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const payload = { base: { HP: 9000 } }
  const doc = pokedexModule.doc('1')
  t.deepEqual(doc.data, pokedex(1))
  await doc.merge(payload).catch(e => t.fail(e.message)) // prettier-ignore
  const mergedResult = merge(pokedex(1), { base: { HP: 9000 } })
  t.deepEqual(pokedexModule.data.get('1'), mergedResult)
  t.deepEqual(doc.data, mergedResult)
})

test('read: stream (collection)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.size, 1)
  const payload = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(payload).catch(e => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const unsubscribe = pokedexModule.openStreams[JSON.stringify(payload)]
  unsubscribe()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  t.deepEqual(pokedexModule.data.size, 2)
  await waitMs(1000)
  t.deepEqual(pokedexModule.data.size, 2)
  // '4': charmander should come in 3rd, but doesn't because we closed the stream
})

test('read: stream (doc)', async t => {
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  const payload = {}
  // do not await, because it only resolves when the stream is closed
  trainerModule.stream(payload).catch(e => t.fail(e.message)) // prettier-ignore
  await waitMs(600)
  // close the stream:
  const unsubscribe = trainerModule.openStreams[JSON.stringify(payload)]
  unsubscribe()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  await waitMs(1000)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  // {colour: 'blue'} should come in 3rd, but doesn't because we closed the stream
})

test('read: get (collection)', async t => {
  // 'get' resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.size, 1)
  try {
    const result = await pokedexModule.get()
    t.deepEqual(result.data.get('1'), pokedex(1))
    t.deepEqual(result.data.get('136'), pokedex(136))
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
  t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  t.deepEqual(pokedexModule.data.size, 2)
})

test('read: get (document)', async t => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  try {
    const result = await trainerModule.get()
    t.deepEqual(result.data, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})
