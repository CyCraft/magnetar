import { pokedex } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'multiple writes (merge → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
        Attack: 50,
        Defense: 49,
        SpAttack: 65,
        SpDefense: 65,
        Speed: 45,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → assign) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → replace) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → insert) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    try {
      pokedexModule.doc('1').insert(pokedex(2))
      await pokedexModule.doc('1').insert(pokedex(3))
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = pokedex(3)
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (deleteProp → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').deleteProp('base')
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { HP: 9000, Attack: 50 },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').merge({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { HP: 9000, Attack: 50 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').merge({ base: { HP: 9000 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
        Attack: 49,
        Defense: 49,
        SpAttack: 65,
        SpDefense: 65,
        Speed: 45,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (deleteProp → assign) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').deleteProp('base')
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (merge → assign) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { Attack: 50 },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → assign) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000, Defense: 49 } })
      await pokedexModule.doc('1').assign({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → assign) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').assign({ base: { HP: 9000 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: { HP: 9000 },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (merge → replace) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (deleteProp → replace) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').deleteProp('base')
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → replace) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').replace({ base: { Attack: 50 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { Attack: 50 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → replace) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').replace({ base: { HP: 9000 } })
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = { base: { HP: 9000 } }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → deleteProp) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {}
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (merge → deleteProp) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (assign → deleteProp) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (insert → deleteProp) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').deleteProp('base')
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName = 'multiple writes (replace → delete) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').replace({ base: { HP: 9000 } })
      await pokedexModule.doc('1').delete()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'multiple writes (merge → delete) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').merge({ base: { HP: 9000 } })
      await pokedexModule.doc('1').delete()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'multiple writes (assign → delete) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    try {
      pokedexModule.doc('1').assign({ base: { HP: 9000 } })
      await pokedexModule.doc('1').delete()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'multiple writes (insert → delete) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
    assert.deepEqual(pokedexModule.doc('1').data, undefined)

    try {
      pokedexModule.doc('1').insert(pokedex(1))
      await pokedexModule.doc('1').delete()
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    assert.deepEqual(pokedexModule.doc('1').data, undefined)
    await firestoreDeepEqual(testName, 'pokedex/1', undefined)
  })
}
{
  const testName = 'timing of multiple writes (merge → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    const all: Promise<any>[] = []
    const debounce = 1000
    let complete = 0
    let timeoutResolve: any = null
    let timeoutReject: any = null

    function testComplete() {
      complete++
      if (complete === all.length - 1) {
        if (timeoutResolve) {
          timeoutResolve()
        }
      }
    }

    // Give some time for previous mutations to be flushed.
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 2000)
    })

    // Time the merges. Watch for early completion and merges that take too long.
    all.push(
      new Promise((resolve, reject) => {
        timeoutResolve = resolve
        timeoutReject = reject

        // Check for early completion
        setTimeout(() => {
          if (complete) {
            reject(new Error(complete + ' tests completed before the debounce time'))
          }
        }, debounce)

        // Check for transactions that take too long.
        setTimeout(() => {
          reject(new Error('timeout - tests completed: ' + complete))
        }, debounce + 500)
      }),
    )

    try {
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { HP: 9000 } })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Attack: 50 } })
          .then(testComplete),
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
      if (timeoutReject) {
        timeoutReject(error)
      }
    }

    await Promise.all(all)

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
        Attack: 50,
        Defense: 49,
        SpAttack: 65,
        SpDefense: 65,
        Speed: 45,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName =
    'timing of multiple writes with custom debounce (merge → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    const all: Promise<any>[] = []
    const debounce = 5000
    let complete = 0
    let timeoutResolve: any = null
    let timeoutReject: any = null

    function testComplete() {
      complete++
      if (complete === all.length - 1) {
        if (timeoutResolve) {
          timeoutResolve()
        }
      }
    }

    // Give some time for previous mutations to be flushed.
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 2000)
    })

    // Time the merges. Watch for early completion and merges that take too long.
    all.push(
      new Promise((resolve, reject) => {
        timeoutResolve = resolve
        timeoutReject = reject

        // Check for early completion
        setTimeout(() => {
          if (complete) {
            reject(new Error(complete + ' tests completed before the debounce time'))
          }
        }, debounce)

        // Check for transactions that take too long.
        setTimeout(() => {
          reject(new Error('timeout - tests completed: ' + complete))
        }, debounce + 500)
      }),
    )

    try {
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { HP: 9000 } }, { syncDebounceMs: debounce })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Attack: 50 } }, { syncDebounceMs: debounce })
          .then(testComplete),
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
      if (timeoutReject) {
        timeoutReject(error)
      }
    }

    await Promise.all(all)

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
        Attack: 50,
        Defense: 49,
        SpAttack: 65,
        SpDefense: 65,
        Speed: 45,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName =
    'timing of multiple writes with various custom debounce (merge → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    const all: Promise<any>[] = []
    const debounce = 2000
    let complete = 0
    let timeoutResolve: any = null
    let timeoutReject: any = null

    function testComplete() {
      complete++
      if (complete === all.length - 1) {
        if (timeoutResolve) {
          timeoutResolve()
        }
      }
    }

    // Give some time for previous mutations to be flushed.
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 2000)
    })

    // Time the merges. Watch for early completion and merges that take too long.
    all.push(
      new Promise((resolve, reject) => {
        timeoutResolve = resolve
        timeoutReject = reject

        // Check for early completion
        setTimeout(() => {
          if (complete) {
            reject(new Error(complete + ' tests completed before the debounce time'))
          }
        }, debounce)

        // Check for transactions that take too long.
        setTimeout(() => {
          reject(new Error('timeout - tests completed: ' + complete))
        }, debounce + 500)
      }),
    )

    // The syncDebounceMs time of the last merge should be the actual debounce time used.
    try {
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { HP: 9000 } }, { syncDebounceMs: debounce + 2000 })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Attack: 50 } }, { syncDebounceMs: debounce + 1000 })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Defense: 55 } }, { syncDebounceMs: debounce + 3000 })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Speed: 46 } }, { syncDebounceMs: debounce })
          .then(testComplete),
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
      if (timeoutReject) {
        timeoutReject(error)
      }
    }

    await Promise.all(all)

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
        Attack: 50,
        Defense: 55,
        SpAttack: 65,
        SpDefense: 65,
        Speed: 46,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
{
  const testName =
    'timing of multiple writes with various custom debounces including 0ms (merge → merge) to the same record'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))
    assert.deepEqual(pokedexModule.doc('1').data, pokedex(1))

    const all: Promise<any>[] = []
    const debounce = 0
    let complete = 0
    let timeoutResolve: any = null
    let timeoutReject: any = null

    function testComplete() {
      complete++
      if (complete === all.length - 1) {
        if (timeoutResolve) {
          timeoutResolve()
        }
      }
    }

    // Give some time for previous mutations to be flushed.
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 2000)
    })

    // Time the merges. Watch for early completion and merges that take too long.
    all.push(
      new Promise((resolve, reject) => {
        timeoutResolve = resolve
        timeoutReject = reject

        // Check for early completion
        setTimeout(() => {
          if (complete) {
            reject(new Error(complete + ' tests completed before the debounce time'))
          }
        }, debounce)

        // Check for transactions that take too long.
        setTimeout(() => {
          reject(new Error('timeout - tests completed: ' + complete))
        }, debounce + 500)
      }),
    )

    // The syncDebounceMs time of the last merge should be the actual debounce time used.
    try {
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { HP: 9000 } }, { syncDebounceMs: debounce + 2000 })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Attack: 50 } }, { syncDebounceMs: debounce + 1000 })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Defense: 55 } }, { syncDebounceMs: debounce + 3000 })
          .then(testComplete),
      )
      all.push(
        pokedexModule
          .doc('1')
          .merge({ base: { Speed: 46 } }, { syncDebounceMs: debounce })
          .then(testComplete),
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
      if (timeoutReject) {
        timeoutReject(error)
      }
    }

    await Promise.all(all)

    const expected = {
      id: 1,
      name: 'Bulbasaur',
      type: ['Grass', 'Poison'],
      base: {
        HP: 9000,
        Attack: 50,
        Defense: 55,
        SpAttack: 65,
        SpDefense: 65,
        Speed: 46,
      },
    }
    assert.deepEqual(pokedexModule.doc('1').data, expected as any)
    await firestoreDeepEqual(testName, 'pokedex/1', expected as any)
  })
}
