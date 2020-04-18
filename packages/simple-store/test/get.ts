import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur, flareon } from './helpers/pokemon'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('get (collection)', async t => {
  // 'get' resolves once all stores have given a response with data
  const { pokedexModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur())
  isModuleDataEqual(t, vueSync, 'pokedex/136', undefined)
  t.deepEqual(pokedexModule.data.size, 1)

  try {
    await pokedexModule.get()
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur())
  isModuleDataEqual(t, vueSync, 'pokedex/136', flareon())
  t.deepEqual(pokedexModule.data.size, 2)
})

test('get (document)', async t => {
  // get resolves once all stores have given a response with data
  const { trainerModule, vueSync } = createVueSyncInstance()
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10 })

  try {
    await trainerModule.get()
  } catch (error) {
    t.fail(error)
  }
  // the local store should have updated its data to the remote store (via the plugin's onNextStoresSuccess handler)
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10, dream: 'job' })
})
