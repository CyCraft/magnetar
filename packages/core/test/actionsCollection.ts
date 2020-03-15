import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { OnRetrieveHandler } from '../src/types/base'

test('write: insert (collection module)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const insertPayload = { name: 'Squirtle', id: '007' }
  const result = await pokedexModule.insert(insertPayload)
  t.deepEqual(result, insertPayload)
  t.deepEqual(pokedexModule.data.local['007'], insertPayload)
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

test('read: get (document)', async t => {
  // get resolves once all stores have given a response with data
  const { trainerModule } = createVueSyncInstance()
  const { retrieved, onRetrieve } = trainerModule.get()
  let ranAllEvents = []
  //   // You can pass a function to `onRetrieve` which gets triggered every time data comes in
  const myHandler: OnRetrieveHandler = (storeName, data) => {
    t.true(['remote', 'local'].includes(storeName))
    t.deepEqual(data, { name: 'Luca', age: 10 })
    ranAllEvents.push(1)
  }
  onRetrieve(myHandler)

  try {
    const data = await retrieved // prettier-ignore
    t.deepEqual(data, { name: 'Luca', age: 10 })
  } catch (error) {
    t.fail(error)
  }
  t.is(ranAllEvents.length, 2)
})
