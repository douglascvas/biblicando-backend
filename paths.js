const path = require('path');

const srcRoot = absolutePath('src/');
const outputRoot = absolutePath('build/');
const mainRoot = `${srcRoot}/main`;
const resourceRoot = `${srcRoot}/resource`;
const testRoot = `${srcRoot}/test`;

function absolutePath(relativePath) {
  return path.resolve(`${__dirname}/${relativePath}`);
}

module.exports = {
  root: `${srcRoot}`,
  baseMain: `${mainRoot}`,
  baseResource: `${resourceRoot}`,
  baseTest: `${testRoot}`,
  tsConfig: absolutePath(`tsconfig.json`),
  typings: absolutePath(`typings/`),
  source: `${mainRoot}/**/*.ts`,
  test: `${testRoot}/**/*.ts`,
  resource: `${resourceRoot}/**/*`,
  output: `${outputRoot}/`,
  outputMain: `${outputRoot}/main`,
  outputResource: `${outputRoot}/resource`,
  outputTest: `${outputRoot}/test`,
  dtsSrc: [
    absolutePath('typings/**/*.d.ts')
  ]
};