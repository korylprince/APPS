#!/bin/bash

export CLIENT_ID="627018447096-i774666v27ta8u1al90h10sh0kr05k7t.apps.googleusercontent.com"
node_version="v10.8.0"
tag=$1

git checkout $tag

source /usr/share/nvm/init-nvm.sh
nvm use $node_version

npm install
rm -Rf dist/
npm run build-prod

tempdir=$(mktemp -d)
cp -R dist/* $tempdir/

git checkout master
git branch -D gh-pages
git checkout --orphan gh-pages
git reset
git add .gitignore
git clean -df

cp -R $tempdir/* ./
rm -Rf $tempdir

git add .
git commit --allow-empty -m "Deploy $tag"

git push --force origin gh-pages

git checkout master
