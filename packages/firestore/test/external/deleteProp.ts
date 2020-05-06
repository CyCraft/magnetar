import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

const conf = (testName: string): any => ({
  configPerStore: { remote: { firestorePath: `vueSyncTests/${testName}/pokedex/1` } },
})

{
  const testName = 'deleteProp'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    const deletePayload = 'age'
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    try {
      await trainerModule.deleteProp(deletePayload)
    } catch (error) {
      t.fail(error)
    }

    const expected = { name: 'Luca' }
    t.deepEqual(trainerModule.data, expected)
    await firestoreDeepEqual(t, testName, '', expected)
  })
}
{
  const testName = 'deleteProp nested'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    const deletePayload = 'base.HP'
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).deleteProp(deletePayload)
    } catch (error) {
      t.fail(error)
    }
    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        'Attack': 49,
        'Defense': 49,
        'Sp. Attack': 65,
        'Sp. Defense': 65,
        'Speed': 45,
      },
    }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'deleteProp multiple'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    const deletePayload = ['base.HP', 'name']
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).deleteProp(deletePayload)
    } catch (error) {
      t.fail(error)
    }

    const expected = {
      id: 1,
      type: ['Grass', 'Poison'],
      base: {
        'Attack': 49,
        'Defense': 49,
        'Sp. Attack': 65,
        'Sp. Defense': 65,
        'Speed': 45,
      },
    }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
