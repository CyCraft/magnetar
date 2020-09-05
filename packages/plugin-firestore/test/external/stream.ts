import test from 'ava'
import { createVueSyncInstance } from '../helpers/createVueSyncInstance'
import { pokedex } from '../helpers/pokedex'
import { waitMs } from '../helpers/wait'

{
  const testName = 'stream (collection)'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    t.deepEqual(pokedexModule.doc('1').data, pokedex(1))
    t.deepEqual(pokedexModule.doc('136').data, undefined)
    t.deepEqual(pokedexModule.data.size, 1)

    const payload = {}
    // do not await, because it only resolves when the stream is closed
    pokedexModule.stream(payload).catch(e => t.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    const unsubscribe = pokedexModule.openStreams.get(payload)
    unsubscribe()

    t.deepEqual(pokedexModule.data.get('1'), pokedex(1))
    t.deepEqual(pokedexModule.data.get('2'), pokedex(2))
    t.deepEqual(pokedexModule.data.get('3'), pokedex(3))
    t.deepEqual(pokedexModule.data.size, 151)
  })
}
{
  const testName = 'stream (doc)'
  test(testName, async t => {
    const { trainerModule } = await createVueSyncInstance('read')
    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10 })

    const payload = {}
    // do not await, because it only resolves when the stream is closed
    trainerModule.stream(payload).catch(e => t.fail(e.message)) // prettier-ignore
    await waitMs(3500)

    // close the stream:
    const unsubscribe = trainerModule.openStreams.get(payload)
    unsubscribe()

    t.deepEqual(trainerModule.data, { name: 'Luca', age: 10, dream: 'job' })
  })
}
{
  const testName = 'stream (collection) where-filter'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read')
    // the original state has 1 pokemon already
    t.deepEqual(pokedexModule.data.size, 1)
    // let's get some more
    const payload = {}
    const pokedexModuleWithQuery = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('base.Speed', 'asc')
      .orderBy('name', 'asc')
    // → Charizard 6, Ninetales 38, Rapidash 78

    // do not await, because it only resolves when the stream is closed
    pokedexModuleWithQuery.stream(payload).catch(e => t.fail(e.message))

    await waitMs(3500)
    // the unsubscribe function to close the stream can be retrieved from the openStreams map with the "payload" as key
    const unsubscribe = pokedexModule
      .where('type', 'array-contains', 'Fire')
      .where('base.Speed', '>=', 100)
      .orderBy('base.Speed', 'asc')
      .orderBy('name', 'asc')
      .openStreams.get(payload)
    // unsubscribe from the stream:
    unsubscribe()
    // the queried instance only has these 3 pokemon
    t.deepEqual([...pokedexModuleWithQuery.data.values()], [pokedex(6), pokedex(38), pokedex(78)])
    // the main instance has one pokemon from the beginning
    t.deepEqual(pokedexModule.data.size, 4)
  })
}
{
  const testName = 'stream: errors are thrown'
  test(testName, async t => {
    const { pokedexModule } = await createVueSyncInstance('read-no-access')

    let error
    try {
      const a = await pokedexModule.stream()
    } catch (_error) {
      error = _error
    }

    t.truthy(error)
  })
}
