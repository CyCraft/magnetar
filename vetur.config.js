// vetur.config.js
/* eslint-disable */
/** @type { import('vls').VeturConfig } */
module.exports = {
  // **optional** default: `{}`
  // override vscode settings
  // Notice: It only affects the settings used by Vetur.
  settings: {
    'vetur.useWorkspaceDependencies': true,
    'vetur.experimental.templateInterpolationService': true,
  },
  /**
   * Support for monorepos
   * See docs: https://vuejs.github.io/vetur/reference/#example
   */
  projects: ['./packages/dev-vue2', './packages/dev-vue3', './packages/docs'],
}
