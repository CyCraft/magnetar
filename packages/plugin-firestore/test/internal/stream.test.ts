import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

{
  const testName = 'stream (doc) edit right before opening'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    trainerModule.merge({ name: 'L' }).catch((e: any) => assert.fail(e.message))
    trainerModule.stream().catch((e: any) => assert.fail(e.message))

    const expected = { name: 'L', age: 10 }
    assert.deepEqual(trainerModule.data, expected)

    await waitMs(2000)
    const at2000 = { ...trainerModule.data }
    await waitMs(3000)
    const at3000 = { ...trainerModule.data }
    await waitMs(4000)
    const at4000 = { ...trainerModule.data }

    assert.deepEqual(
      { at2000, at3000, at4000 },
      { at2000: expected, at3000: expected, at4000: expected },
    )

    // close the stream
    trainerModule.closeStream()
  })
}
{
  const testName = 'stream (doc) edit and await right before opening'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    await trainerModule.merge({ name: 'L' })
    trainerModule.stream().catch((e: any) => assert.fail(e.message))

    await waitMs(2000)
    assert.deepEqual(trainerModule.data, { name: 'L', age: 10 })

    trainerModule.closeStream()
  })
}
{
  const testName = 'stream (collection) edit right before opening'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    pokedexModule
      .doc('1')
      .merge({ name: 'B' })
      .catch((e: any) => assert.fail(e.message))
    pokedexModule.stream().catch((e: any) => assert.fail(e.message))

    const expected = { ...pokedex(1), name: 'B' }

    assert.deepEqual(pokedexModule.data.get('1'), expected)

    await waitMs(2000)
    const at2000 = { ...pokedexModule.data.get('1') }
    await waitMs(3000)
    const at3000 = { ...pokedexModule.data.get('1') }
    await waitMs(4000)
    const at4000 = { ...pokedexModule.data.get('1') }

    assert.deepEqual(
      { at2000, at3000, at4000 },
      { at2000: expected, at3000: expected, at4000: expected },
    )

    // close the stream:
    pokedexModule.closeStream()
  })
}
{
  const testName = 'stream (collection) edit and await right before opening'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await pokedexModule.doc('1').merge({ name: 'B' })
    pokedexModule.stream().catch((e: any) => assert.fail(e.message))

    await waitMs(2000)
    assert.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })

    // close the stream:
    pokedexModule.closeStream()
  })
}
{
  const testName = 'stream events (before and success) are called for added documents'
  test(testName, async () => {
    let beforeCount = 0
    let successCount = 0

    const { magnetar } = await createMagnetarInstance(testName)

    // Create a new module with event handlers
    const pokedexModuleWithEvents = magnetar.collection('pokedex', {
      configPerStore: {
        cache: { initialData: [] },
        remote: { firestorePath: 'magnetarTests/read/pokedex' },
      },
      on: {
        before: ({ actionName, streamEvent }) => {
          if (actionName === 'stream' && streamEvent === 'added') {
            beforeCount++
          }
        },
        success: ({ actionName, streamEvent }) => {
          if (actionName === 'stream' && streamEvent === 'added') {
            successCount++
          }
        },
      },
    })

    await new Promise<void>((resolve) => {
      pokedexModuleWithEvents
        .stream({ onFirstData: () => resolve() })
        .catch((e: any) => assert.fail(e.message))
    })

    // Verify events were called 151 times (one for each Pokemon)
    assert.equal(beforeCount, 151, 'before events should be called 151 times')
    assert.equal(successCount, 151, 'success events should be called 151 times')

    pokedexModuleWithEvents.closeStream()
  })
}
