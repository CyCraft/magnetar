import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, PokedexEntry, pokedexGetAll, waitMs } from '@magnetarjs/test-utils'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual'
import { DocInstance } from '../../../core/src'

{
  const testName = 'insert multiple documents in fast succession with one fail'
  test(testName, async (t) => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      deletePaths: ['pokedex/7', 'pokedex/8'],
    })
    const payloadNg = { ...pokedex(7), failBecauseOf: undefined }
    const payloadOk = pokedex(8)
    t.deepEqual(pokedexModule.doc('7').data, undefined)
    t.deepEqual(pokedexModule.doc('8').data, undefined)

    let moduleOk: DocInstance<PokedexEntry> | undefined
    let error: any
    const result = await Promise.allSettled([
      pokedexModule.insert(payloadNg, { syncDebounceMs: 0 }),
      pokedexModule.insert(payloadOk, { syncDebounceMs: 0 }),
    ])
    result.forEach((settled) => {
      if (settled.status === 'fulfilled') moduleOk = settled.value
      if (settled.status === 'rejected') error = settled.reason
    })
    // check if definitely the error occured
    t.is(error?.code, 'invalid-argument')

    if (!moduleOk) return t.fail()
    t.is(moduleOk.id, '8')

    t.deepEqual(moduleOk.data, payloadOk)
    await firestoreDeepEqual(t, testName, `pokedex/7`, undefined as any)
    await firestoreDeepEqual(t, testName, `pokedex/8`, payloadOk as any)
  })
}
