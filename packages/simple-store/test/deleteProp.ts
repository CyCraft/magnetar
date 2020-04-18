import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { isModuleDataEqual } from './helpers/compareModuleData'
import { bulbasaur } from './helpers/pokemon'

test('deleteProp', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  const deletePayload = 'age'
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca' })
})

test('deleteProp nested', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const deletePayload = 'type.grass'
  isModuleDataEqual(t, vueSync, 'pokedex/001', { name: 'Bulbasaur', id: '001', type: { grass: 'Grass' } }) // prettier-ignore

  try {
    await pokedexModule.doc('001').deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'pokedex/001', { name: 'Bulbasaur', id: '001', type: {} })
})
