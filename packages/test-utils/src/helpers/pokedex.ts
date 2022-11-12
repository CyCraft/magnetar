import { copy } from 'copy-anything'
import { merge } from 'merge-anything'
import { PokedexEntry, allPokemonArray } from './pokemon'
export type { PokedexEntry, PokemonType } from './pokemon'

export function pokedexEntryDefaults(values: { [key in string]: any }): PokedexEntry {
  const defaults = {
    id: 0,
    name: '',
    type: [],
    base: {
      HP: 0,
      Attack: 0,
      Defense: 0,
      SpAttack: 0,
      SpDefense: 0,
      Speed: 0,
    },
  }
  return merge(defaults, values)
}

export function pokedex(pokedexNr: number): PokedexEntry {
  const entryIndex = pokedexNr - 1
  return copy(allPokemonArray[entryIndex])
}

export function pokedexGetAll(): PokedexEntry[] {
  return copy(allPokemonArray)
}

export function pokedexMap(): Map<string, PokedexEntry> {
  const entries: [string, PokedexEntry][] = copy(allPokemonArray).map((p) => [String(p.id), p])
  return new Map(entries)
}
