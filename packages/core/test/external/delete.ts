import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'

test('delete', async t => {
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete()
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data, undefined)
})

test('revert: delete (local → remote)', async t => {
  const { trainerModule } = createVueSyncInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete('remote', { onError: 'revert', executionOrder: ['local', 'remote'] }) // mocks error on delete for remote store mock
  } catch (error) {
    t.truthy(error)
  }

  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
})

// todo: for this test to work we need to mock a data pool for the remote plugin mock
// test('revert: delete (remote → local)', async t => {
//   const { trainerModule } = createVueSyncInstance()
//   t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

//   try {
//     await trainerModule.delete('local', { onError: 'revert', executionOrder: ['remote', 'local'] }) // mocks error on delete for remote store mock
//   } catch (error) {
//     t.truthy(error)
//   }

//   t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
// })
