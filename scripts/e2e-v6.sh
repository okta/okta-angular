#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup-e2e.sh

if [ ! -z "$AUTHJS_VERSION" ]; then
  echo "Skipping e2e tests against auth-js v6.x"
  exit ${SUCCESS}
fi

setup_service java 1.8.222
setup_service google-chrome-stable 106.0.5249.61-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e"

export ISSUER=https://javascript-idx-sdk.okta.com/oauth2/default
export SPA_CLIENT_ID=0oa17suj5x9khaVH75d7
export USERNAME=mary@acme.com
get_vault_secret_key repo_gh-okta-okta-auth-js/default password PASSWORD
export ORG_OIE_ENABLED=true

export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

if ! yarn add -DW --ignore-scripts @okta/okta-auth-js@^6; then
  echo "auth-js v6.x could not be installed"
  exit ${FAILED_SETUP}
fi

# Install dependencies for test apps
for app in test/apps/angular-*
do
  pushd $app
    if ! yarn add --ignore-scripts @okta/okta-auth-js@^6; then
      echo "auth-js v6.x could be installed in test app ${app}"
      exit ${FAILED_SETUP}
    fi
  popd
done

if ! yarn test:e2e; then
  echo "unit failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
