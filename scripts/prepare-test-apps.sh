pushd ./dist
yarn yalc publish
popd

yarn lerna exec -- yarn yalc add @okta/okta-angular
yarn lerna exec -- yarn build:prod
