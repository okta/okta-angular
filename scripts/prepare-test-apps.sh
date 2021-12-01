pushd ./dist
npx yalc publish
popd

yarn lerna exec -- npx yalc add @okta/okta-angular
yarn lerna exec -- yarn build --prod
