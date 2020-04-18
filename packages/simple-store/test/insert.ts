import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { squirtle } from './helpers/pokemon'
import { DocInstance } from '@vue-sync/core'

test('write: insert (document)', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const insertPayload = squirtle
  t.deepEqual(pokedexModule.data.get('007'), undefined)
  await pokedexModule.doc('007').insert(insertPayload).catch(e => t.fail(e.message)) // prettier-ignore
  t.deepEqual(pokedexModule.doc('007').data, insertPayload)
  t.deepEqual(pokedexModule.data.get('007'), insertPayload)
  t.deepEqual(vueSync.doc('pokedex/007').data, insertPayload)
  t.deepEqual(vueSync.collection('pokedex').doc('007').data, insertPayload)
})

test('write: insert (collection) → random ID', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const insertPayload = squirtle

  let moduleFromResult: DocInstance
  try {
    moduleFromResult = await pokedexModule.insert(insertPayload)
  } catch (error) {
    t.fail(error)
  }
  const newId = moduleFromResult.id
  const moduleFromLookup = vueSync.doc(`pokedex/${newId}`)
  const pokedexModuleLookup = vueSync.collection('pokedex')
  const moduleFromLookup2 = pokedexModuleLookup.doc(newId)
  const moduleFromLookup3 = pokedexModule.doc(newId)
  t.deepEqual(moduleFromResult.data, insertPayload)
  t.deepEqual(moduleFromResult.data, moduleFromLookup.data)
  t.deepEqual(moduleFromResult.data, moduleFromLookup2.data)
  t.deepEqual(moduleFromResult.data, moduleFromLookup3.data)
  t.deepEqual(pokedexModule.data.get(newId), insertPayload)
})
