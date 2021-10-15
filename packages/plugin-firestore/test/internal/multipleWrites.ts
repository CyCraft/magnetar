import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'

{
  const testName = 'multiple writes (merge → merge) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        'HP': 9000,
        'Attack': 50,
        'Defense': 49,
        'SpAttack': 65,
        'SpDefense': 65,
        'Speed': 45,
      },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → assign) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → replace) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → insert) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/1'] })
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(2))
      await pokedexModule.doc('1').insert(pokedex(3))
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = pokedex(3)
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (deleteProp → merge) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').deleteProp('base')
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → merge) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { HP: 9000, Attack: 50 },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → merge) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { HP: 9000, Attack: 50 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → merge) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/1'] })
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').merge({ base: { HP: 9000 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        'HP': 9000,
        'Attack': 49,
        'Defense': 49,
        'SpAttack': 65,
        'SpDefense': 65,
        'Speed': 45,
      },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (deleteProp → assign) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').deleteProp('base')
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (merge → assign) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → assign) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000, Defense: 49 } })
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → assign) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/1'] })
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').assign({ base: { HP: 9000 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { HP: 9000 },
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (merge → replace) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (deleteProp → replace) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').deleteProp('base')
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → replace) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → replace) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/1'] })
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').replace({ base: { HP: 9000 } })
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = { base: { HP: 9000 } }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → deleteProp) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {}
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (merge → deleteProp) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → deleteProp) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → deleteProp) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/1'] })
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
    }
    t.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(t, testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → delete) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').delete()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    t.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'multiple writes (merge → delete) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').delete()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    t.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'multiple writes (assign → delete) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(t, testName, 'pokedex/1', pokedex(1))
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').delete()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    t.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'multiple writes (insert → delete) to the same record'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, { deletePaths: ['pokedex/1'] })
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
    t.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').delete()
    } catch (error) {
      t.fail(JSON.stringify(error))
    }

    t.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(t, testName, 'pokedex/1', undefined)
  })
}
