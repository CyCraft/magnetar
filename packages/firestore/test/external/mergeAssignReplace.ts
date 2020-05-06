import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

const conf = (testName: string): any => ({
  configPerStore: { remote: { firestorePath: `vueSyncTests/${testName}/pokedex/1` } },
})

{
  const testName = 'merge'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: 9000 } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).merge(payload)
    } catch (error) {
      t.fail(error)
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        'HP': 9000,
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
  const testName = 'assign'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: 9000 } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).assign(payload)
    } catch (error) {
      t.fail(error)
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
      },
    }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'replace'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: 9000 } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).replace(payload)
    } catch (error) {
      t.fail(error)
    }

    const expected = { base: { HP: 9000 } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'revert: merge'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).merge(payload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'revert: assign'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).assign(payload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
{
  const testName = 'revert: replace'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    const payload = { base: { HP: undefined } }
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, pokedex(1))

    try {
      await pokedexModule.doc('1', conf(testName)).replace(payload, { onError: 'revert' })
    } catch (error) {
      t.truthy(error)
    }

    const expected = pokedex(1)
    t.deepEqual(pokedexModule.doc('1', conf(testName)).data, expected)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected)
  })
}
