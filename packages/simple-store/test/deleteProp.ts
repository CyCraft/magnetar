import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { isModuleDataEqual } from './helpers/compareModuleData'

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

test('deleteProp multiple', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const deletePayload = ['type.grass', 'name']
  isModuleDataEqual(t, vueSync, 'pokedex/001', { name: 'Bulbasaur', id: '001', type: { grass: 'Grass' } }) // prettier-ignore

  try {
    await pokedexModule.doc('001').deleteProp(deletePayload)
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'pokedex/001', { id: '001', type: {} })
})

test('revert: deleteProp', async t => {
  const { trainerModule, vueSync } = createVueSyncInstance()
  const deletePayload = ['age', 'remote'] // this triggers an error on the remote store mock
  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10 })

  try {
    await trainerModule.deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'data/trainer', { name: 'Luca', age: 10 })
})

test('revert: deleteProp nested', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const deletePayload = ['type.grass', 'remote'] // this triggers an error on the remote store mock
  isModuleDataEqual(t, vueSync, 'pokedex/001', { name: 'Bulbasaur', id: '001', type: { grass: 'Grass' } }) // prettier-ignore

  try {
    await pokedexModule.doc('001').deleteProp(deletePayload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'pokedex/001', { name: 'Bulbasaur', id: '001', type: { grass: 'Grass' } }) // prettier-ignore
})
