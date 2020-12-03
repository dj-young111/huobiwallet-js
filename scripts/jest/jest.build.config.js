const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const baseConfig = require('./jest.src.config');

// Find all folders in packages/* with package.json
const packagesRoot = join(__dirname, '..', '..', 'packages');
const packages = readdirSync(packagesRoot).filter((dir) => {
  if (dir.charAt(0) === '.') {
    return false;
  }
  if (dir === 'events') {
    // There's an actual Node package called "events"
    // that's used by jsdom so we don't want to alias that.
    return false;
  }
  const packagePath = join(packagesRoot, dir, 'package.json');
  return statSync(packagePath).isFile();
});
// Create a module map to point packages to the build output
const moduleNameMapper = {};
packages.forEach((name) => {
  // Root entry point
  moduleNameMapper[`^${name}$`] = `<rootDir>/packages/${name}/dist/index.js`;
  // Named entry points
  // moduleNameMapper[`^${name}/(.*)$`] = `<rootDir>/dist/node_modules/${name}/$1`
});

module.exports = Object.assign({}, baseConfig, {
  // Redirect imports to the compiled bundles
  moduleNameMapper,
  // Don't run bundle tests on blacklisted -test.internal.* files
  testPathIgnorePatterns: ['/node_modules/', '-test.internal.js$'],
  // Exclude the build output from transforms
  transformIgnorePatterns: ['/node_modules/', '<rootDir>/build/'],
});
