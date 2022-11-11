module.exports = {
  root: true,
  plugins: ['solid', 'prettier'],
  extends: [
    '@antfu/eslint-config-ts',
    'plugin:solid/typescript',
    'plugin:prettier/recommended'
  ],
  ignorePatterns: ['**/node_modules', '**/dist', 'generated', 'public/models'],
  rules: {
    'no-console': 'warn',
    'antfu/if-newline': 'off',
    'antfu/generic-spacing': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }]
  }
}
