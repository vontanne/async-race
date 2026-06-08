import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import templateParser from '@angular-eslint/template-parser';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.spec.ts'],
  },

  // ── TypeScript source files ───────────────────────────────────────────────
  {
    files: ['**/*.ts'],
    extends: [
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      '@angular-eslint': angular,
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
      },
    },
    rules: {
      // ── Angular 21 recommended ────────────────────────────────────────────
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-inputs-metadata-property': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-outputs-metadata-property': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',

      // ── typescript-eslint overrides for Angular patterns ─────────────────
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // ── Airbnb-aligned rules ──────────────────────────────────────────────
      'no-magic-numbers': ['warn', {
        ignore: [0, 1, -1],
        ignoreArrayIndexes: true,
        ignoreDefaultValues: true,
      }],
      'max-lines-per-function': ['error', {
        max: 40,
        skipBlankLines: true,
        skipComments: true,
      }],
      'no-var': 'error',
      'prefer-const': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      eqeqeq: ['error', 'always'],
      'no-duplicate-imports': 'error',
    },
  },

  // ── Angular HTML templates ────────────────────────────────────────────────
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    languageOptions: {
      parser: templateParser,
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/eqeqeq': 'error',
    },
  },
);
