import { pokedex } from '@magnetarjs/test-utils'
import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'

test('delete (document)', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete()
  } catch (error) {
    t.fail(error)
  }

  t.deepEqual(trainerModule.data, undefined)
})

test('delete (collection)', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  t.is(pokedexModule.data.size, 1)
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))

  try {
    await pokedexModule.delete('1')
  } catch (error) {
    t.fail(error)
  }
  t.is(pokedexModule.data.size, 0)
  t.deepEqual(pokedexModule.data.get('1'), undefined)
})

test('revert: delete (local → remote)', async (t) => {
  const { trainerModule } = createMagnetarInstance()
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
//   const { trainerModule } = createMagnetarInstance()
//   t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

//   try {
//     await trainerModule.delete('local', { onError: 'revert', executionOrder: ['remote', 'local'] }) // mocks error on delete for remote store mock
//   } catch (error) {
//     t.truthy(error)
//   }

//   t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
// })
