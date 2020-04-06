import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, charmander, squirtle, flareon } from './helpers/pokemon'
import { waitMs } from './helpers/wait'
import { VueSyncModuleInstance } from '../src/CreateModule'

test('write: insert (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
  t.deepEqual(pokedexModule.data['007'], undefined)
  const result = await pokedexModule.insert(insertPayload).catch(t.fail)
  t.deepEqual(result, insertPayload)
  t.deepEqual(pokedexModule.data['007'], insertPayload)
})

// test('only:write: insert (collection module) creates submodules', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   const insertPayload = squirtle
//   t.deepEqual(pokedexModule.data['007'], undefined)
//   const result = await pokedexModule.insert(insertPayload).catch(t.fail)
//   t.deepEqual(result, insertPayload)
//   const newSubModule = pokedexModule.doc('007')
//   t.deepEqual(newSubModule.data, insertPayload)
// })

test('write: insert multiple (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = [charmander, squirtle]
  t.deepEqual(pokedexModule.data['004'], undefined)
  t.deepEqual(pokedexModule.data['007'], undefined)
  const result = await pokedexModule.insert(insertPayload).catch(t.fail)
  t.deepEqual(result, insertPayload)
  t.deepEqual(pokedexModule.data['004'], charmander)
  t.deepEqual(pokedexModule.data['007'], squirtle)
})

test('delete: (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const deletePayload = '001'
  t.deepEqual(pokedexModule.data['001'], bulbasaur)
  const result = await pokedexModule.delete(deletePayload).catch(t.fail)
  t.deepEqual(result, undefined)
  t.deepEqual(pokedexModule.data['001'], undefined)
})

test('delete: multiple (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const deletePayload = ['001']
  t.deepEqual(pokedexModule.data['001'], bulbasaur)
  const result = await pokedexModule.delete(deletePayload).catch(t.fail)
  t.deepEqual(result, undefined)
  t.deepEqual(pokedexModule.data['001'], undefined)
})

test('delete: (document module)', async t => {
  const { trainerModule } = createVueSyncInstance()
  const deletePayload = 'age'
  t.deepEqual(trainerModule.data.age, 10)
  const result = await trainerModule.delete(deletePayload).catch(t.fail)
  t.deepEqual(result, undefined)
  t.deepEqual(trainerModule.data.age, undefined)
})

test('write: merge (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const mergePayload = { id: '001', type: { alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data['001'], bulbasaur)
  const result = await pokedexModule.merge(mergePayload).catch(t.fail)
  t.deepEqual(result, mergePayload)
  const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data['001'], mergedResult)
})

// test('only:write: merge (sub-doc module)', async t => {
//   const { pokedexModule } = createVueSyncInstance()
//   const mergePayload = { type: { alt: 'Leaf' } }
//   t.deepEqual(pokedexModule.data['001'], bulbasaur)
//   const result = await pokedexModule
//     .doc('001')
//     .merge(mergePayload)
//     .catch(t.fail)
//   t.deepEqual(result, mergePayload)
//   const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
//   t.deepEqual(pokedexModule.data['001'].data, mergedResult)
// })

test('write: merge (document module)', async t => {
  const { trainerModule } = createVueSyncInstance()
  const mergePayload = { nickName: 'Mesqueeb' }
  const trainer = { name: 'Luca', age: 10 }
  t.deepEqual(trainerModule.data, trainer)
  const result = await trainerModule.merge(mergePayload).catch(t.fail)
  t.deepEqual(result, mergePayload)
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, nickName: 'Mesqueeb' })
})

test('read: stream (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
  const streamPayload = {}
  // do not await, because it only resolves when the stream is closed
  pokedexModule.stream(streamPayload).catch(t.fail)
  await waitMs(600)
  // close the stream:
  const unsubscribe = pokedexModule.openStreams[JSON.stringify(streamPayload)]
  unsubscribe()
  t.deepEqual(pokedexModule.data, { '001': bulbasaur, '136': flareon })
  await waitMs(1000)
  t.deepEqual(pokedexModule.data, { '001': bulbasaur, '136': flareon })
  // '004': charmander should come in 3rd, but doesn't because we closed the stream
})

test('read: stream (doc module)', async t => {
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })
  const streamPayload = {}
  // do not await, because it only resolves when the stream is closed
  trainerModule.stream(streamPayload).catch(t.fail)
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
  t.deepEqual(pokedexModule.data, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(
      {},
      {
        on: {
          success: ({ result, storeName }) => {
            if (storeName === 'local') {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(pokedexModule.data, { '001': bulbasaur })
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
  t.deepEqual(pokedexModule.data, { '001': bulbasaur, '136': flareon })
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
