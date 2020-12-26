export declare type PokemonType = 'Normal' | 'Fire' | 'Fighting' | 'Water' | 'Flying' | 'Grass' | 'Poison' | 'Electric' | 'Ground' | 'Psychic' | 'Rock' | 'Ice' | 'Bug' | 'Dragon' | 'Ghost' | 'Dark' | 'Steel' | 'Fairy';
export declare type PokedexEntry = {
    id?: number;
    name: string;
    type: PokemonType[];
    base: {
        'HP': number;
        'Attack': number;
        'Defense': number;
        'Sp. Attack': number;
        'Sp. Defense': number;
        'Speed': number;
    };
};
export declare const allPokemonArray: PokedexEntry[];
