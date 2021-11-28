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
    trainerModule.merge({ name: 'L' })
    trainerModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
    await waitMs(2000)

    t.deepEqual(trainerModule.data, { name: 'L', age: 10 })
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
    trainerModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
    await waitMs(2000)

    t.deepEqual(trainerModule.data, { name: 'L', age: 10 })
  })
}
{
  const testName = 'stream (collection) edit right before opening'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })
    pokedexModule.doc('1').merge({ name: 'B' })
    pokedexModule.stream(undefined, { modifyReadResponseOn: {added: (payload)=> {
			console.log(`payload → `, payload)
			return payload
		}}}).catch((e: any) => t.fail(e.message)) // prettier-ignore
    t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
    await waitMs(3000)
    t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'Bulbasaur' })

    await waitMs(5000)
    t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
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
    pokedexModule.stream().catch((e: any) => t.fail(e.message)) // prettier-ignore
    await waitMs(2000)
    // close the stream:
    pokedexModule.closeStream()

    t.deepEqual(pokedexModule.data.get('1'), { ...pokedex(1), name: 'B' })
  })
}
