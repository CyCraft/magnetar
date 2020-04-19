import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { squirtle } from './helpers/pokemon'
import { DocInstance } from '@vue-sync/core'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('insert (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = squirtle()
  isModuleDataEqual(t, vueSync, 'pokedex/007', undefined)

  try {
    await pokedexModule.doc('007').insert(payload)
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'pokedex/007', payload)
})

test('insert (collection) → random ID', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = squirtle()

  let moduleFromResult: DocInstance
  try {
    moduleFromResult = await pokedexModule.insert(payload)
  } catch (error) {
    t.fail(error)
  }
  const newId = moduleFromResult.id
  isModuleDataEqual(t, vueSync, `pokedex/${newId}`, payload)
})

test('revert: insert (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = { ...squirtle(), shouldFail: 'remote' }
  isModuleDataEqual(t, vueSync, 'pokedex/007', undefined)

  try {
    await pokedexModule.doc('007').insert(payload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }

  isModuleDataEqual(t, vueSync, 'pokedex/007', undefined)
})

test('revert: insert (collection) → random ID', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = { ...squirtle(), shouldFail: 'remote' }

  let moduleFromResult: DocInstance
  try {
    moduleFromResult = await pokedexModule.insert(payload, { onError: 'revert' })
  } catch (error) {
    t.fail(error)
  }
  const newId = moduleFromResult.id
  isModuleDataEqual(t, vueSync, `pokedex/${newId}`, undefined)
})
