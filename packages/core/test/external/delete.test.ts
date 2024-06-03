import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('delete (document)', async () => {
  const { trainerModule } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete()
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  assert.deepEqual(trainerModule.data, undefined)
})

test('delete (collection)', async () => {
  const { pokedexModule } = createMagnetarInstance()
  assert.deepEqual(pokedexModule.data.size, 1)
  assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))

  try {
    await pokedexModule.delete('1')
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }
  assert.deepEqual(pokedexModule.data.size, 0)
  assert.deepEqual(pokedexModule.data.get('1'), undefined)
})

test('revert: delete (cache → remote)', async () => {
  const { trainerModule } = createMagnetarInstance()
  assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    await trainerModule.delete('remote', { onError: 'revert', executionOrder: ['cache', 'remote'] }) // mocks error on delete for remote store mock
  } catch (error) {
    assert.isTrue(!!error)
  }

  assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
})

// todo: for this test to work we need to mock a data pool for the remote plugin mock
// test('revert: delete (remote → cache)', async t => {
//   const { trainerModule } = createMagnetarInstance()
//   assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

//   try {
//     await trainerModule.delete('cache', { onError: 'revert', executionOrder: ['remote', 'cache'] }) // mocks error on delete for remote store mock
//   } catch (error) {
//     assert.isTrue(!!error)
//   }

//   assert.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
// })
