import { MagnetarInstance } from '@magnetarjs/core';
import { ActionTree } from 'vuex';
export declare const presetActionsDoc: ActionTree<Record<string, any>, Record<string, any>>;
export declare const presetActionsCollection: ActionTree<Record<string, any>, Record<string, any>>;
export declare const vuexEasyFirestoreActionsDoc: (magnetar: MagnetarInstance) => ActionTree<Record<string, any>, Record<string, any>>;
/**
 * preset actions: `set`, `patch`, `insert`, `delete`, `openDBChannel`, `fetchAndAdd`, `closeDBChannel`, `fetchById`, `duplicate`
 */
export declare const vuexEasyFirestoreActionsCollection: (magnetar: MagnetarInstance) => ActionTree<Record<string, any>, Record<string, any>>;
