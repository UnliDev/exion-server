module.exports = {
  root: true,
  extends: ['airbnb-typescript/base'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'graphql'],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    node: true,
  },
  rules: {
    "no-unused-vars": "off",
    "import/prefer-default-export": "off",
    "class-methods-use-this": "off",
    "@typescript-eslint/no-unused-vars": ["warn"]
  },
};
