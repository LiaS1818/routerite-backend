#!/usr/bin/env node

/**
 * Post-build script to fix the compiled fsq-developers-places SDK
 *
 * Problems:
 * 1. package.json has "main": "./index.ts" which should be "./index.js"
 * 2. index.js uses openapi_json_1.default but JSON imports don't have .default in CommonJS
 *
 * Solutions:
 * 1. Change package.json "main" to "./index.js"
 * 2. Remove .default from openapi_json_1.default in index.js
 */

const fs = require('fs');
const path = require('path');

const sdkDir = path.join(__dirname, '../dist/.api/apis/fsq-developers-places');
const packageJsonPath = path.join(sdkDir, 'package.json');
const indexJsPath = path.join(sdkDir, 'index.js');

let fixesApplied = [];
let errors = [];

// Fix 1: package.json main field
try {
  if (!fs.existsSync(packageJsonPath)) {
    console.log('[fix-fsqr-package] package.json not found, skipping...');
  } else {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    if (packageJson.main === './index.ts') {
      packageJson.main = './index.js';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      fixesApplied.push('package.json main: ./index.ts → ./index.js');
    }
  }
} catch (error) {
  errors.push(`package.json: ${error.message}`);
}

// Fix 2: index.js openapi import
try {
  if (!fs.existsSync(indexJsPath)) {
    console.log('[fix-fsqr-package] index.js not found, skipping...');
  } else {
    let indexJs = fs.readFileSync(indexJsPath, 'utf8');

    // Replace openapi_json_1.default with openapi_json_1
    const oldPattern = 'oas_1.default.init(openapi_json_1.default)';
    const newPattern = 'oas_1.default.init(openapi_json_1)';

    if (indexJs.includes(oldPattern)) {
      indexJs = indexJs.replace(oldPattern, newPattern);
      fs.writeFileSync(indexJsPath, indexJs);
      fixesApplied.push('index.js: removed .default from openapi_json_1');
    }
  }
} catch (error) {
  errors.push(`index.js: ${error.message}`);
}

// Report results
if (errors.length > 0) {
  console.error('[fix-fsqr-package] ✗ Errors occurred:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else if (fixesApplied.length > 0) {
  console.log('[fix-fsqr-package] ✓ Applied fixes:');
  fixesApplied.forEach(fix => console.log(`  - ${fix}`));
} else {
  console.log('[fix-fsqr-package] ✓ SDK already correct, no fixes needed');
}
