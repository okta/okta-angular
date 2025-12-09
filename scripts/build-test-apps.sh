for app in test/apps/angular-*
do
  pushd $app
    yarn install
    yarn build:prod
  popd
done

