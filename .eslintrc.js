
const BUNDLE_FOR_PROD = process.env.BUNDLE === 'production' || process.env.BUNDLE === 'prod'

const custom_rules = {
  'no-console': BUNDLE_FOR_PROD ? 'error' : 'warn',
  'no-debugger': BUNDLE_FOR_PROD ? 'error' : 'warn',
  camelcase: 'off',
  'prefer-promise-reject-errors': 'off',
  'no-throw-literal': 'off',
  'no-mixed-operators': 'off',
  'comma-dangle': ['warn', {
    arrays: 'only-multiline',
    objects: 'only-multiline',
    imports: 'only-multiline',
    exports: 'only-multiline',
    functions: 'ignore',
  }],
  'no-trailing-spaces': [
    'error', {
      skipBlankLines: true,
    },
  ],
  'no-unused-vars': [
    'warn',
    {
      args: 'after-used',
      argsIgnorePattern: '^_\\w+'
    }
  ],

  // TODO: drop out following rules:
  'no-var': ['off'],
  'multiline-ternary': ['off'],
}

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'standard',
  ],
  rules: custom_rules,
  overrides: [
    {
      files: ['{,**/}*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      },
      extends: [
        'standard-with-typescript',
      ],
      plugins: [
        '@typescript-eslint',
      ],
      rules: {
        ...custom_rules,
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            types: ['boolean'],
            format: ['snake_case', 'camelCase'],
            // format: ['snake_case', 'camelCase', 'PascalCase'],
          },
        ],
      },
    },
    {
      files: ['{,**/}*.spec.js'],
      env: { jest: true },
    },
  ],
}
