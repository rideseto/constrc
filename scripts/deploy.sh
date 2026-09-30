#!/usr/bin/env bash
set -e

echo "🚀 Building production bundle..."
npm run build
touch dist/.nojekyll

echo "📦 Deploying to GitHub Pages (gh-pages branch)..."
git -C dist init -b gh-pages
git -C dist add -A
git -C dist commit -m "Deploy site to GitHub Pages: $(date '+%Y-%m-%d %H:%M:%S')"
git -C dist push -f https://github.com/rideseto/nexus-construction-3d.git gh-pages

echo "✅ Successfully deployed to https://rideseto.github.io/nexus-construction-3d/"
