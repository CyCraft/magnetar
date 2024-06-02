import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

{
  const testName = 'fetchCount (collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read', {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
    assert.deepEqual(pokedexModule.doc('136').data, undefined)
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(pokedexModule.count, 1)

    let result: number
    try {
      result = await pokedexModule.fetchCount()
    } catch (error) {
      console.error(error)
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))
    assert.deepEqual(pokedexModule.doc('136').data, undefined)
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(pokedexModule.count, 151)
    assert.deepEqual(result, 151)
  })
}
{
  const testName = 'fetchSum (collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read', {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(pokedexModule.sum, {})

    let result: number
    try {
      result = await pokedexModule.fetchSum('base.HP')
    } catch (error) {
      console.error(error)
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(result, 9696)
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(pokedexModule.sum, { base: { HP: 9696 } })
  })
}

{
  const testName = 'fetchAverage (collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read', {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(pokedexModule.average, {})

    let result: number
    try {
      result = await pokedexModule.fetchAverage('base.HP')
    } catch (error) {
      console.error(error)
      assert.fail(JSON.stringify(error))
    }
    assert.deepEqual(result, 64.21192052980132)
    assert.deepEqual(pokedexModule.data.size, 1)
    assert.deepEqual(pokedexModule.average, { base: { HP: 64.21192052980132 } })
  })
}
