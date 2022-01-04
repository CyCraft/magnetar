import { pokedex, pokedexGetAll } from '@magnetarjs/test-utils'
import { createMagnetarInstance } from '../createMagnetarInstance'

const immediate = { syncDebounceMs: 1 }

export async function setupTestDatabase() {
  // setup read DB
  const { pokedexModule, trainerModule } = await createMagnetarInstance('read')
  const allPokemon = pokedexGetAll()
  
  await Promise.all(allPokemon.map((pokemon) => {
    return pokedexModule.insert(pokemon, immediate)
  }))

  await trainerModule.merge({
    age: 10,
    dream: 'job',
    name: 'Luca',
  }, immediate)
  
  // setup read DB
  const readNoAccess = await createMagnetarInstance('read-no-access')
  await readNoAccess.pokedexModule.insert(pokedex(1), immediate)
  await readNoAccess.trainerModule.merge({
    age: 10,
    dream: 'job',
    name: 'Luca',
  }, immediate)

  console.log(`🧳 ALL POKEMON INSERTED 🏁`)
}
