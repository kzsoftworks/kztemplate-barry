/** @type {import('prettier').Config} */
const config = {
  endOfLine: 'lf',
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  arrowParens: 'always',
  plugins: ['prettier-plugin-tailwindcss']
};

export default config;
