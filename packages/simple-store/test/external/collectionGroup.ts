import test from 'ava'

import { createVueSyncInstance } from '../helpers/createVueSyncInstance'

test('get (collectionGroup)', async t => {
  t.pass()
  //   // get resolves once all stores have given a response with data
  //   const { trainerModule} = createVueSyncInstance()
  //   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  //   try {
  //     await trainerModule.get()
  //   } catch (error) {
  //     t.fail(error)
  //   }
  //   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  //   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

// test('get (collectionGroup) where-filter: ==', async t => {
//   // get resolves once all stores have given a response with data
//   const { trainerModule} = createVueSyncInstance()
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

//   try {
//     await trainerModule.get()
//   } catch (error) {
//     t.fail(error)
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
// })
