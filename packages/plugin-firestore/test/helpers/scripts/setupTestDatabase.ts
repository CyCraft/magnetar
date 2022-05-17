import { pokedex, pokedexGetAll } from '@magnetarjs/test-utils'
import { createMagnetarInstance, DateDoc } from '../createMagnetarInstance'

const immediate = { syncDebounceMs: 1 }

export async function setupTestDatabase() {
  // setup read DB
  const { pokedexModule, trainerModule, datesModule } = await createMagnetarInstance('read')
  const allPokemon = pokedexGetAll()
  
  await Promise.all(allPokemon.map((pokemon) => {
    return pokedexModule.insert(pokemon, immediate)
  }))
  
  const dateDocs: DateDoc[] = [
    { date: new Date(2000, 0, 5) },
    { date: new Date(2010, 0, 5) },
    { date: new Date(2020, 0, 5) },
    { date: new Date(2030, 0, 5) },
    { date: new Date(2040, 0, 5) },
    { date: new Date(2050, 0, 5) },
  ]
  await Promise.all(dateDocs.map((doc) => {
    return datesModule.insert(doc, immediate)
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
