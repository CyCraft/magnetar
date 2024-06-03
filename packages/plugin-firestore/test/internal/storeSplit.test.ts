import { pokedex } from '@magnetarjs/test-utils'
import { storeSplit } from '@magnetarjs/utils'
import { merge } from 'merge-anything'
import { assert, test } from 'vitest'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance.js'
import { firestoreDeepEqual } from '../helpers/firestoreDeepEqual.js'

{
  const testName = 'write: merge (document) with storeSplit'
  test(testName, async () => {
    const { pokedexModule } = await createMagnetarInstance(testName, {
      insertDocs: { 'pokedex/1': pokedex(1) },
    })

    const doc = pokedexModule.doc('1')
    assert.deepEqual(doc.data, pokedex(1))
    await firestoreDeepEqual(testName, 'pokedex/1', pokedex(1))

    try {
      await doc.merge(
        { base: { HP: storeSplit({ cache: 9000, remote: '9000' }) } },
        { syncDebounceMs: 1 },
      )
    } catch (error) {
      assert.fail(JSON.stringify(error))
    }

    const mergedResult = merge(pokedex(1), { base: { HP: 9000 } })

    assert.deepEqual(pokedexModule.data.get('1'), mergedResult)
    assert.deepEqual(doc.data, mergedResult)

    await firestoreDeepEqual(testName, 'pokedex/1', merge(pokedex(1), { base: { HP: '9000' } }))

    const fetchedDoc = await doc.fetch({ force: true })
    assert.deepEqual(fetchedDoc?.base.HP as any, '9000')
    assert.deepEqual(doc.data?.base.HP as any, '9000')
  })
}
