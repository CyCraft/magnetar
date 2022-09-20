import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, waitMs } from '@magnetarjs/test-utils'

{
  const testName = 'stream (doc) edit right before opening'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    trainerModule.merge({ name: 'L' }).catch((e: any) => t.fail(e.message))
    trainerModule.stream().catch((e: any) => t.fail(e.message))

    const expected = { name: 'L', age: 10 }
    t.deepEqual(trainerModule.data, expected)

    await waitMs(2000)
    const at2000 = { ...trainerModule.data }
    await waitMs(3000)
    const at3000 = { ...trainerModule.data }
    await waitMs(4000)
    const at4000 = { ...trainerModule.data }

    t.deepEqual(
      { at2000, at3000, at4000 },
      { at2000: expected, at3000: expected, at4000: expected }
    )

    // close the stream
    trainerModule.closeStream()
  })
}
{
  const testName = 'stream (doc) edit and await right before opening'
  test(testName, async (t) => {
    const { trainerModule } = await createMagnetarInstance(testName, {
      insertDocs: { '': { age: 10, name: 'Luca' } },
    })
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    await trainerModule.merge({ name: 'L' })
    trainerModule.stream().catch((e: any) => t.fail(e.message))

    await waitMs(2000)
    t.deepEqual(trainerModule.data, { name: 'L', age: 10 })

    trainerModule.closeStream()
  })
}
{
  const testName = 'stream (collection) edit right before opening'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    pokedexModule
      .doc('1')
      .merge({ name: 'B' })
      .catch((e: any) => t.fail(e.message))
    pokedexModule.stream().catch((e: any) => t.fail(e.message))

    const expected = { ...pokedex(1), name: 'B' }

    t.deepEqual(pokedexModule.data.get('1'), expected)

    await waitMs(2000)
    const at2000 = { ...pokedexModule.data.get('1') }
    await waitMs(3000)
    const at3000 = { ...pokedexModule.data.get('1') }
    await waitMs(4000)
    const at4000 = { ...pokedexModule.data.get('1') }

    t.deepEqual(
      { at2000, at3000, at4000 },
      { at2000: expected, at3000: expected, at4000: expected }
    )

    // close the stream:
    pokedexModule.closeStream()
  })
}
{
  const testName = 'stream (collection) edit and await right before opening'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    await pokedexModule.doc('1').merge({ name: 'B' })
    pokedexModule.stream().catch((e: any) => t.fail(e.message))

    await waitMs(2000)
    t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })

    // close the stream:
    pokedexModule.closeStream()
  })
}
