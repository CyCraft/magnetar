import config from '@cycraft/eslint/config'

export default [
  {
    ignores: ['**/dist/*'],
  },
  ...config,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
]
