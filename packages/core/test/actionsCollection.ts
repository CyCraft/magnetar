import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, charmander, squirtle, flareon } from './helpers/pokemon'

test('write: insert (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = squirtle
  t.deepEqual(pokedexModule.data.local['007'], undefined)
  t.deepEqual(pokedexModule.data.remote['007'], undefined)
  const result = await pokedexModule.insert(insertPayload)
  t.deepEqual(result, insertPayload)
  t.deepEqual(pokedexModule.data.local['007'], insertPayload)
  t.deepEqual(pokedexModule.data.remote['007'], insertPayload)
})

test('write: merge (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const mergePayload = { id: '001', type: { alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data.local['001'], bulbasaur)
  t.deepEqual(pokedexModule.data.remote['001'], bulbasaur)
  const result = await pokedexModule.merge(mergePayload)
  t.deepEqual(result, mergePayload)
  const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data.local['001'], mergedResult)
  t.deepEqual(pokedexModule.data.remote['001'], mergedResult)
})

test('write: merge (document module)', async t => {
  const { trainerModule } = createVueSyncInstance()
  const mergePayload = { nickName: 'Mesqueeb' }
  const trainer = { name: 'Luca', age: 10 }
  t.deepEqual(trainerModule.data.local, trainer)
  t.deepEqual(trainerModule.data.remote, trainer)
  const result = await trainerModule.merge(mergePayload)
  t.deepEqual(result, mergePayload)
  t.deepEqual(trainerModule.data.local, { name: 'Luca', age: 10, nickName: 'Mesqueeb' })
  t.deepEqual(trainerModule.data.remote, { name: 'Luca', age: 10, nickName: 'Mesqueeb' })
})

// test('read action - stream', async t => {
//   const streamInfo = usersModule.stream()
//   const { onRetrieve, opened, closed, close } = streamInfo

//   // this promise gets triggered once
//   //   resolves when the stream was correctly opened;
//   //   rejected when the stream couldn't be opened
//   opened // prettier-ignore
//     .then(storeName => {})
//     .catch(error => {})

//   // this promise gets triggered once
//   //   resolves when the stream was (a) correctly closed or (b) the store provided doesn't have stream functionality;
//   //   rejected when the stream was closed because of an error
//   closed // prettier-ignore
//     .then(storeName => {})
//     .catch(error => {})

//   // You can pass a function to `onRetrieve` which gets triggered every time data comes in
//   onRetrieve((storeName, dataArray) => {})

//   setTimeout(() => {
//     // use `close()` to close the stream
//     // the promise returned from this is the same promise as the one returned in `closed`
//     close() // prettier-ignore
//       .then(() => {})
//       .catch(error => {})
//   }, 1000)
// })

test('read: get (collection)', async t => {
  // get resolves once all stores have given a response with data
  const { pokedexModule } = createVueSyncInstance()
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur })
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur })
  try {
    const result = await pokedexModule.get(
      {},
      {
        on: {
          local: {
            success: ({ result }) => {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(result, [bulbasaur, charmander])
              t.deepEqual(pokedexModule.data.local, { '001': bulbasaur, '004': charmander })
            },
          },
          remote: {
            success: ({ result }) => {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(result, [bulbasaur, flareon])
              t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur, '136': flareon })
            },
          },
        },
      }
    )
    t.deepEqual(result, [bulbasaur, flareon])
  } catch (error) {
    t.fail(error)
  }
  t.deepEqual(pokedexModule.data.remote, { '001': bulbasaur, '136': flareon })
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(pokedexModule.data.local, { '001': bulbasaur, '136': flareon })
})

test('read: get (document)', async t => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data.local, { name: 'Luca', age: 10 })
  t.deepEqual(trainerModule.data.remote, { name: 'Luca', age: 10 })
  try {
    const result = await trainerModule.get(
      {},
      {
        on: {
          local: {
            success: ({ result }) => {
              // here we check if the data returned at this point is actually what that store plugin should return
              t.deepEqual(result, { name: 'Luca', age: 10, colour: 'blue' })
              t.deepEqual(trainerModule.data.local, { name: 'Luca', age: 10, colour: 'blue' })
            },
          },
        },
      }
    )
    t.deepEqual(result, { name: 'Luca', age: 10, dream: 'job' })
  } catch (error) {
    t.fail(error)
  }
  t.deepEqual(trainerModule.data.remote, { name: 'Luca', age: 10, dream: 'job' })
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  t.deepEqual(trainerModule.data.local, { name: 'Luca', age: 10, dream: 'job' })
})
