#!/bin/sh

rm -rf dist-release
npm run release
cp package.json dist-release/package.json
cp README.md dist-release/README.md
cp LICENSE dist-release/LICENSE
cd dist-release
npm publish
