module.exports = {
  parser: 'babel-eslint',
  env: {
    node: true,
    commonjs: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    quotes: ['error', 'single'],
    'prefer-const': 2,
  },
};
