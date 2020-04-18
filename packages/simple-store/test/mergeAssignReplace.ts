import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur } from './helpers/pokemon'
import { isModuleDataEqual } from './helpers/compareModuleData'

test('merge', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = { type: { alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur())

  try {
    await pokedexModule.doc('001').merge(payload)
  } catch (error) {
    t.fail(error)
  }

  const expected = { id: '001', name: 'Bulbasaur', type: { grass: 'Grass', alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', expected)
})

test('assign', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = { type: { alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur())

  try {
    await pokedexModule.doc('001').assign(payload)
  } catch (error) {
    t.fail(error)
  }

  const expected = { id: '001', name: 'Bulbasaur', type: { alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', expected)
})

test('replace', async t => {
  const { pokedexModule, vueSync } = createVueSyncInstance()
  const payload = { type: { alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', bulbasaur())

  try {
    await pokedexModule.doc('001').replace(payload)
  } catch (error) {
    t.fail(error)
  }

  const expected = { type: { alt: 'Leaf' } }
  isModuleDataEqual(t, vueSync, 'pokedex/001', expected)
})
