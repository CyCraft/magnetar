import test from 'ava'
import { createVueSyncInstance } from './helpers/createVueSyncInstance'
import { bulbasaur } from './helpers/pokemon'

test('write: merge (document)', async t => {
  const { pokedexModule } = createVueSyncInstance()
  const mergePayload = { id: '001', type: { alt: 'Leaf' } }
  const doc = pokedexModule.doc('001')
  t.deepEqual(doc.data, bulbasaur)
  await doc.merge(mergePayload).catch(e => t.fail(e.message)) // prettier-ignore
  const mergedResult = { name: 'Bulbasaur', id: '001', type: { grass: 'Grass', alt: 'Leaf' } }
  t.deepEqual(pokedexModule.data.get('001'), mergedResult)
  t.deepEqual(doc.data, mergedResult)
})
