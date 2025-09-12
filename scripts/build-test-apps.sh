for app in test/apps/angular-*
do
  pushd $app
    yarn build:prod
  popd
done

