#!/usr/bin/env node

/**
 * Script to check if the version in package.json already has a git tag
 * This prevents committing when the package.json version hasn't been updated
 */

const { execSync } = require('child_process');
const packageJson = require('../package.json');

const version = packageJson.version;
const tagName = `v${version}`;

try {
  // Check if the tag exists
  const tagExists = execSync(`git tag -l "${tagName}"`).toString().trim() === tagName;
  
  if (tagExists) {
    console.error('\x1b[31mError: Git tag already exists for current version in package.json\x1b[0m');
    console.error(`\x1b[31mThe version ${version} already has a tag (${tagName})\x1b[0m`);
    console.error('\x1b[31mPlease update the version in package.json before committing\x1b[0m');
    process.exit(1);
  } else {
    console.log(`\x1b[32mVersion check passed. Version ${version} doesn't have a tag yet.\x1b[0m`);
    process.exit(0);
  }
} catch (error) {
  console.error('\x1b[31mError checking git tags:\x1b[0m', error.message);
  process.exit(1);
}