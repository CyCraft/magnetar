import { VueSyncInstance } from '../../src';
import { CollectionInstance } from '../../src/Collection';
import { DocInstance } from '../../src/Doc';
export interface PokedexModuleData {
    id?: string;
    name: string;
    type?: {
        [type: string]: string | undefined | null;
    };
    seen?: boolean;
    shouldFail?: string;
}
export interface TrainerModuleData {
    name: string;
    age?: number;
    nickName?: string;
    dream?: string;
    shouldFail?: string;
}
export declare function createVueSyncInstance(): {
    pokedexModule: CollectionInstance<PokedexModuleData>;
    trainerModule: DocInstance<TrainerModuleData>;
    vueSync: VueSyncInstance;
};
