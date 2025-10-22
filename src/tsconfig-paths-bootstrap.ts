import { register } from 'tsconfig-paths';
import { resolve } from 'path';

// Registrar tsconfig-paths para resolver módulos correctamente en runtime
// Cuando se ejecuta desde dist/, necesitamos que @api/fsq-developers-places
// resuelva a dist/.api/apis/fsq-developers-places (compilado)
// en lugar de .api/apis/fsq-developers-places (TypeScript)

// __dirname será dist/src cuando se ejecute el código compilado
// Necesitamos apuntar a dist/ como baseUrl
const baseUrl = resolve(__dirname, '..');

console.log('[tsconfig-paths] Registering module resolution');
console.log('[tsconfig-paths] baseUrl:', baseUrl);
console.log('[tsconfig-paths] __dirname:', __dirname);

register({
  baseUrl: baseUrl,
  paths: {
    '@api/fsq-developers-places': ['.api/apis/fsq-developers-places'],
  },
});