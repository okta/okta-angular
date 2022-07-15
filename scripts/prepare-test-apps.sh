pushd ./dist
npx yalc publish
popd

npx lerna exec -- npx yalc add @okta/okta-angular
npx lerna exec -- yarn build:prod
