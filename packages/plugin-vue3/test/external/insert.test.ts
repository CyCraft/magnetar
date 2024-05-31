import { pokedex, PokedexEntry } from '@magnetarjs/test-utils'
import type { DocInstance } from '@magnetarjs/types'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

test('insert (document)', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = pokedex(7)
  assert.deepEqual(pokedexModule.doc('7').data, undefined)

  try {
    await pokedexModule.doc('7').insert(payload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
  }

  assert.deepEqual(pokedexModule.doc('7').data, payload)
})

test('insert (collection) → random ID', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = pokedex(7)

  let moduleFromResult: DocInstance<PokedexEntry>
  try {
    moduleFromResult = await pokedexModule.insert(payload)
  } catch (error) {
    assert.fail(JSON.stringify(error))
    return
  }
  const newId = moduleFromResult.id
  assert.deepEqual(pokedexModule.doc(newId).data, payload)
})

test('revert: insert (document)', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { ...pokedex(7), shouldFail: 'remote' }
  assert.deepEqual(pokedexModule.doc('7').data, undefined)

  try {
    await pokedexModule.doc('7').insert(payload, { onError: 'revert' })
  } catch (error) {
    assert.isTrue(!!error)
  }

  assert.deepEqual(pokedexModule.doc('7').data, undefined)
})

test('revert: insert (collection) → random ID', async () => {
  const { pokedexModule } = createMagnetarInstance()
  const payload = { ...pokedex(7), shouldFail: 'remote' }

  try {
    await pokedexModule.insert(payload, { onError: 'revert' })
    assert.fail()
  } catch (error) {
    assert.isTrue(!!error)
  }
  assert.deepEqual(pokedexModule.doc('7').data, undefined)
})
