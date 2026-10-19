import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    '**/.next',
    '**/next-env.d.ts',
    '**/node_modules',
    '**/yarn.lock',
    '**/package-lock.json',
    '**/public',
    '**/*.test.js',
    '**/coverage',
    // Build natijasi — avval `npm run lint` shu yerdagi minifikatsiya qilingan
    // fayllarni ham tekshirib, 800+ "xato" chiqarardi
    'out/**',
  ]),
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/no-unknown-property': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  // Yangi MilliyGo kodi (TypeScript). Eski TSX fayllar hali bu qoidalarga
  // moslanmagan — ular qamrovdan tashqarida (REDESIGN_NOTES.md ga qarang).
  {
    files: [
      'src/features/go/**/*.{ts,tsx}',
      'src/components/common/ApiGap.tsx',
      'src/components/common/CLayout.tsx',
      'src/pages/index.tsx',
      'src/pages/restaurants/**/*.tsx',
      'src/pages/restaurant/**/*.tsx',
      'src/pages/store/**/*.tsx',
      'src/pages/cart/**/*.tsx',
      'src/pages/checkout/**/*.tsx',
      'src/pages/orders/**/*.tsx',
      'src/pages/profile/**/*.tsx',
      'src/pages/search/**/*.tsx',
      'src/pages/auth/login/**/*.tsx',
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
