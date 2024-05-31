import { pokedex, waitMs } from '@magnetarjs/test-utils'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'

{
  const testName = 'stream (collection)'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    assert.deepEqual(pokedexModule.doc('136').data, undefined)
    assert.deepEqual(pokedexModule.data.size, 0)

    // do not await, because it only resolves when the stream is closed
    pokedexModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    pokedexModule.closeStream()

    assert.deepEqual(pokedexModule.data.get('1'), pokedex(1))
    assert.deepEqual(pokedexModule.data.get('2'), pokedex(2))
    assert.deepEqual(pokedexModule.data.get('3'), pokedex(3))
    assert.deepEqual(pokedexModule.data.size, 151)
  })
}
{
  const testName = 'stream (doc)'
  test(testName, async () => {
    const { trainerModule } = await createMagnetarInstance('read')
    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    // do not await, because it only resolves when the stream is closed
    trainerModule.stream().catch((e: any) => assert.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    trainerModule.closeStream()

    assert.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  })
}
{
  const testName = 'stream (collection) where-filter'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read')
    assert.deepEqual(pokedexModule.data.size, 0)
    // let's get some more
    const pokedexModuleWithQuery = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('base.Speed', 'asc')
      .orderBy('name', 'asc')
    // → Charizard 6, Ninetales 38, Rapidash 78

    // do not await, because it only resolves when the stream is closed
    pokedexModuleWithQuery.stream().catch((e: any) => assert.fail(e.message))

    await waitMs(5000)
    pokedexModuleWithQuery.closeStream()

    // the queried instance only has these 3 Pokemon
    assert.deepEqual(
      [...pokedexModuleWithQuery.data.values()],
      [pokedex(6), pokedex(38), pokedex(78)],
    )
    assert.deepEqual(pokedexModule.data.size, 3)
  })
}
{
  const testName = 'stream: errors are thrown'
  // TODO: somehow this doesn't work with the admin sdk emulators, but it does with the client sdk emulators!
  //      I think it's not an issue in production though...
  test.skip(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance('read-no-access')

    let error
    try {
      // @ts-expect-error unused variable
      const a = await pokedexModule.stream()
    } catch (_error) {
      error = _error
    }

    assert.isTrue(!!error)
  })
}
