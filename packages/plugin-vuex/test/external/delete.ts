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
  t.deepEqual(pokedexModule.data.size, 1)
  t.deepEqual(pokedexModule.data.get('1'), pokedex(1))

  try {
    await pokedexModule.delete('1')
  } catch (error) {
    t.fail(error)
  }
  t.deepEqual(pokedexModule.data.size, 0)
  t.deepEqual(pokedexModule.data.get('1'), undefined)
})

test('revert: delete', async (t) => {
  const { trainerModule } = createMagnetarInstance()
  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })

  try {
    // @ts-ignore
    await trainerModule.delete('remote', { onError: 'revert' }) // mocks error on delete for remote store mock
  } catch (error) {
    t.truthy(error)
  }

  t.deepEqual(trainerModule.data, { age: 10, name: 'Luca' })
})
