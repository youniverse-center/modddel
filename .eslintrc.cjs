module.exports = {
  env: {
    browser: true,
    node: true,
  },
  ignorePatterns: ['dist'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'sort-keys-fix'],
  rules: {
    '@typescript-eslint/member-delimiter-style': ['error', {
      multiline: { delimiter: 'comma', requireLast: true },
      singleline: { delimiter: 'comma', requireLast: false },
    }],
    'arrow-parens': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-trailing-spaces': 'error',
    'no-useless-constructor': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'sort-keys-fix/sort-keys-fix': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      asyncArrow: 'always',
      named: 'never',
    }],
  },
}