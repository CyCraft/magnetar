import test from 'ava'
import { createMagnetarInstance } from '../helpers/createMagnetarInstance'
import { pokedex, pokedexGetAll } from '@magnetarjs/test-utils'

test('map mock', async (t) => {
  const { pokedexModule } = createMagnetarInstance()
  try {
    await pokedexModule.fetch({ force: true })
  } catch (error) {
    t.fail(JSON.stringify(error))
  }
  t.deepEqual(pokedexModule.data.get('136'), pokedex(136))
  t.deepEqual(pokedexModule.data.has('136'), true)
  t.deepEqual(
    [...pokedexModule.data.keys()],
    pokedexGetAll().map((p) => `${p.id}`)
  )
  t.deepEqual([...pokedexModule.data.values()], pokedexGetAll())
  const ids: string[] = []
  pokedexModule.data.forEach((p) => ids.push(`${p.id}`))
  t.deepEqual([...pokedexModule.data.keys()], ids)
  t.deepEqual(pokedexModule.data.size, 151)
  pokedexModule.data.clear()
  t.deepEqual(pokedexModule.data.size, 0)
  t.deepEqual([...pokedexModule.data.keys()].length, 0)
})
