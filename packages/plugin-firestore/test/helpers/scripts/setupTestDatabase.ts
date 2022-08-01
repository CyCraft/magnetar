import arrayShuffle from 'array-shuffle'
import { pokedex, pokedexGetAll, allMovesArray, MoveEntry } from '@magnetarjs/test-utils'
import { createMagnetarInstance, DateDoc } from '../createMagnetarInstance'

const immediate = { syncDebounceMs: 1 }

export async function setupTestDatabase() {
  // setup read DB
  const { pokedexModule, trainerModule, datesModule, movesModuleOf } = await createMagnetarInstance(
    'read'
  )
  const allPokemon = pokedexGetAll()

  await Promise.all(
    allPokemon.map((pokemon) => {
      return pokedexModule.insert(pokemon, immediate)
    })
  )

  const movesPool = arrayShuffle(allMovesArray)
  const pkmnPool = [...allPokemon]
  const movesToInsert: [number, MoveEntry[]][] = []
  while (movesPool.length && pkmnPool.length) {
    const fourMoves = [movesPool.pop(), movesPool.pop(), movesPool.pop(), movesPool.pop()].filter(
      (move): move is MoveEntry => !!move
    )
    const pkmn = pkmnPool.pop()
    const pkmnId = pkmn?.id
    if (fourMoves.length === 4 && pkmnId) {
      movesToInsert.push([pkmnId, fourMoves])
    }
  }
  try {
    await Promise.all(
      movesToInsert.flatMap(([pkmnId, moves]) =>
        moves.map((move) => movesModuleOf(pkmnId).insert(move))
      )
    )
  } catch (e) {
    console.error(`!!!`)
    throw e
  }

  const dateDocs: DateDoc[] = [
    { date: new Date(2000, 0, 5) },
    { date: new Date(2010, 0, 5) },
    { date: new Date(2020, 0, 5) },
    { date: new Date(2030, 0, 5) },
    { date: new Date(2040, 0, 5) },
    { date: new Date(2050, 0, 5) },
  ]
  await Promise.all(
    dateDocs.map((doc) => {
      return datesModule.insert(doc, immediate)
    })
  )

  await trainerModule.merge(
    {
      age: 10,
      dream: 'job',
      name: 'Luca',
    },
    immediate
  )

  // setup read DB
  const readNoAccess = await createMagnetarInstance('read-no-access')
  await readNoAccess.pokedexModule.insert(pokedex(1), immediate)
  await readNoAccess.trainerModule.merge(
    {
      age: 10,
      dream: 'job',
      name: 'Luca',
    },
    immediate
  )

  console.log(`🧳 ALL POKEMON INSERTED 🏁`)
}
