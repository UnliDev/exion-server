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
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/quotes": "off",
    "max-len": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "arrow-parens": "off",
    "@typescript-eslint/naming-convention": "off",
    "import/no-useless-path-segments": "off",
    "import/no-cycle": "off",
    "no-return-await": "off",
    "no-nested-ternary": "off",
    "consistent-return": "off",
    "prefer-destructuring": "off",
  },
};
