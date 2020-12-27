import { PokedexEntry } from './pokemon';
export { PokedexEntry, PokemonType } from './pokemon';
export declare function pokedexEntryDefaults(values: {
    [key: string]: any;
}): PokedexEntry;
export declare function pokedex(pokedexNr: number): PokedexEntry;
export declare function pokedexGetAll(): PokedexEntry[];
export declare function pokedexMap(): Map<string, PokedexEntry>;
