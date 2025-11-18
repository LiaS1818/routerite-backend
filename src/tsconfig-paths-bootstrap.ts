import { resolve } from 'path';
import * as Module from 'module';
import * as fs from 'fs';

// AGGRESSIVE module resolution override to force @api/fsq-developers-places to load from dist
// This bypasses the symlink issue by intercepting module resolution before Node follows the symlink

// __dirname será dist/src cuando se ejecute el código compilado
const projectRoot = resolve(__dirname, '../..');

// Try a list of candidate SDK entry paths in order of preference.
// Historically the code expected the SDK to be copied to `dist/.api/.../index.js`,
// but the build only copies some JSON/assets. The original generated SDK lives
// at `./.api/apis/fsq-developers-places/index.js` in the repo root. Also allow
// fallback to a node_modules installed package if present.
const candidates = [
  resolve(projectRoot, 'dist/.api/apis/fsq-developers-places/index.js'),
  resolve(projectRoot, '.api/apis/fsq-developers-places/index.js'),
  resolve(projectRoot, 'node_modules/@api/fsq-developers-places/index.js'),
];

let compiledSdkPath: string | undefined;
for (const c of candidates) {
  if (fs.existsSync(c)) {
    compiledSdkPath = c;
    break;
  }
}

console.log('[module-override] ========================================');
console.log('[module-override] Registering aggressive module resolution');
console.log('[module-override] Project root:', projectRoot);
console.log('[module-override] SDK candidate paths:', candidates);
console.log('[module-override] Selected SDK path:', compiledSdkPath || '(none found)');

// If we found an SDK file, try to sanity-check it
if (compiledSdkPath) {
  try {
    // Some SDK builds export default, some don't — guard access.
    const maybeSdk = require(compiledSdkPath);
    const testSdk = maybeSdk && (maybeSdk.default || maybeSdk);
    if (testSdk && testSdk.spec && typeof testSdk.spec.operation === 'function') {
      const op = testSdk.spec.operation('/places/search', 'get');
      const params = op.getParameters();
      console.log('[module-override] ✓ SDK test load successful - params:', params.length);
    } else {
      console.log('[module-override] ⚠ SDK loaded but shape is unexpected');
    }
  } catch (e: any) {
    console.error('[module-override] ✗ SDK test load FAILED:', e && e.message ? e.message : e);
  }
}

console.log('[module-override] ========================================');

// Override Node's module resolution
const originalResolveFilename = (Module as any)._resolveFilename;

(Module as any)._resolveFilename = function(request: string, parent: any, isMain: boolean) {
  // Intercept @api/fsq-developers-places and redirect to compiled version
  if (request === '@api/fsq-developers-places') {
    console.log('[module-override] ⚡ INTERCEPTED: @api/fsq-developers-places → ', compiledSdkPath);
    return compiledSdkPath;
  }

  // For all other modules, use the original resolution
  return originalResolveFilename.call(this, request, parent, isMain);
};