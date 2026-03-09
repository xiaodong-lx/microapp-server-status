/**
 * Build script
 * Generate configuration files and component registration info
 */

import { generateAppJson } from './generators/app-json.js';

console.log('\n🚀 Building...\n');

// Generate app.json
generateAppJson();

console.log('\n✅ Build completed!\n');
