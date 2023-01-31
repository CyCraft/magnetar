/**
 * NOTE:
 *  avoid typedef errors due to `tsc --noEmit`.
 * `defineNuxtConfig` is defined by default in IDE like vscode.
 */
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiKey: 'AIzaSyDivMlXIuHqDFsTCCqBDTVL0h29xbltcL8',
      authDomain: 'tests-firestore.firebaseapp.com',
      databaseURL: 'https://tests-firestore.firebaseio.com',
      projectId: 'tests-firestore',
    },
  },
  /**
   * NOTE:
   *  'fast-sort' is provided by CommonJS module as default.
   *  Nuxt 3 need to require ES Modules.
   *  https://nuxt.com/docs/guide/concepts/esm#troubleshooting-esm-issues
   */
  build: {
    transpile: ['fast-sort'],
  },
})
