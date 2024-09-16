module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
    checkJs: true, // Enable type-checking for JS files
  },
  extends: "eslint:recommended",
  globals: {},
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // Show error for undefined variables
    "no-undef": "error",
    // Show warning for unused variables
    "no-unused-vars": "warn",
    // Optional: Ensure consistent return statements
    "consistent-return": "warn",
    // Optional: Catch common mistakes and auto-fix them
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
  },
};
