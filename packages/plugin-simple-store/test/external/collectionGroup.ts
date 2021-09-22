import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'

test('fetch (collectionGroup)', async (t) => {
  t.pass()
  //   // get resolves once all stores have given a response with data
  //   const { trainerModule} = createMagnetarInstance()
  //   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

  //   try {
  //     await trainerModule.fetch({ force: true })
  //   } catch (error) {
  //     t.fail(JSON.stringify(error))
  //   }
  //   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  //   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
})

// test('fetch (collectionGroup) where-filter: ==', async t => {
//   // get resolves once all stores have given a response with data
//   const { trainerModule} = createMagnetarInstance()
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

//   try {
//     await trainerModule.fetch({ force: true })
//   } catch (error) {
//     t.fail(JSON.stringify(error))
//   }
//   // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
//   t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
// })
