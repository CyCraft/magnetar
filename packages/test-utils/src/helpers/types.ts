export type PokemonType =
  | 'Normal'
  | 'Fire'
  | 'Fighting'
  | 'Water'
  | 'Flying'
  | 'Grass'
  | 'Poison'
  | 'Electric'
  | 'Ground'
  | 'Psychic'
  | 'Rock'
  | 'Ice'
  | 'Bug'
  | 'Dragon'
  | 'Ghost'
  | 'Dark'
  | 'Steel'
  | 'Fairy'

export type PokedexEntry = {
  id?: number
  name: string
  type: PokemonType[]
  base: {
    HP: number
    Attack: number
    Defense: number
    SpAttack: number
    SpDefense: number
    Speed: number
  }
}

export type MoveEntry = {
  accuracy: null | number
  category: string
  cname: string
  ename: string
  id: number
  jname: string
  power: null | number
  pp: null | number
  max_pp?: number
  tm?: number
  type: PokemonType
}
