import js from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import stylisticPlugin from '@stylistic/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'
import tsParser from '@typescript-eslint/parser'
import globals from 'globals'
import prettierPlugin from 'eslint-plugin-prettier'
import eslintConfigPrettier from 'eslint-config-prettier'
import jestPlugin from 'eslint-plugin-jest'

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/env.d.ts',
      '**/vite.config.ts',
      '**/.pnp.cjs',
      '**/.pnp.loader.mjs',
      '**/eslint.config.js',
      '**/jest.config.ts',
      '**/.yarn/*',
      '**/postcss.config.js',
      '**/tailwind.config.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}', '**/*.test.js', '**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2025,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@stylistic': stylisticPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
      prettier: prettierPlugin,
      jest: jestPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        alias: {
          map: [
            ['@src', './src'],
            ['@api', './src/api'],
            ['@hooks', './src/hooks'],
            ['@components', './src/components'],
            ['@utils', './src/utils'],
            ['@assets', './src/assets'],
            ['@pages', './src/pages'],
          ],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react/hook-use-state': [
        'error',
        {
          allowDestructuredState: false,
        },
      ],
      'react/jsx-handler-names': [
        'error',
        {
          eventHandlerPrefix: 'handle',
          eventHandlerPropPrefix: 'on',
        },
      ],
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
        },
      ],
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
        },
      ],
      'react/jsx-filename-extension': [
        2,
        {
          extensions: ['.ts', '.tsx'],
        },
      ],

      '@stylistic/jsx-pascal-case': [
        2,
        {
          allowAllCaps: true,
        },
      ],
      '@stylistic/jsx-curly-brace-presence': ['error', 'always'],
      '@stylistic/jsx-closing-bracket-location': 'error',
      '@stylistic/type-annotation-spacing': 'error',
      '@stylistic/no-empty-function': 'off',

      'no-empty-function': 'off',
      'no-unused-vars': 'off',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['state'],
        },
      ],

      'prettier/prettier': 'error',
      ...eslintConfigPrettier.rules,

      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error',

      'max-len': ['error', { 
        code: 100,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
        ignorePattern: 'class|className|^import\\s.+\\sfrom\\s.+;$'
      }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="tw"][arguments.length=0]',
          message: 'Do not use empty tw`` template literals'
        }
      ],
    },
  },
]
