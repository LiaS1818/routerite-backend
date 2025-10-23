import { resolve } from 'path';
import * as Module from 'module';
import * as fs from 'fs';

// AGGRESSIVE module resolution override to force @api/fsq-developers-places to load from dist
// This bypasses the symlink issue by intercepting module resolution before Node follows the symlink

// __dirname será dist/src cuando se ejecute el código compilado
const projectRoot = resolve(__dirname, '../..');
const compiledSdkPath = resolve(projectRoot, 'dist/.api/apis/fsq-developers-places/index.js');

console.log('[module-override] ========================================');
console.log('[module-override] Registering aggressive module resolution');
console.log('[module-override] Project root:', projectRoot);
console.log('[module-override] Compiled SDK path:', compiledSdkPath);
console.log('[module-override] SDK file exists?', fs.existsSync(compiledSdkPath));

// Test load the SDK to verify it works
try {
  const testSdk = require(compiledSdkPath).default;
  const op = testSdk.spec.operation('/places/search', 'get');
  const params = op.getParameters();
  console.log('[module-override] ✓ SDK test load successful - params:', params.length);
} catch (e) {
  console.error('[module-override] ✗ SDK test load FAILED:', e.message);
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