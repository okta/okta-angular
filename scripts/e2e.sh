#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup-e2e.sh

setup_service java 1.8.222
setup_service google-chrome-stable 106.0.5249.61-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e"

export ISSUER=https://samples-javascript.okta.com/oauth2/default
export SPA_CLIENT_ID=0oapmwm72082GXal14x6
export USERNAME=george@acme.com
get_vault_secret_key devex/samples-javascript password PASSWORD

export CI=true
export DBUS_SESSION_BUS_ADDRESS=/dev/null

# Run unit tests for e2e apps
for app in test/apps/angular-*
do
  pushd $app
    if ! yarn test:unit; then
      echo "unit failed for ${app}! Exiting..."
      exit ${TEST_FAILURE}
    fi
  popd
done

# Run e2e tests
if ! yarn test:e2e; then
  echo "unit failed! Exiting..."
  exit ${TEST_FAILURE}
fi

echo ${TEST_SUITE_TYPE} > ${TEST_SUITE_TYPE_FILE}
echo ${TEST_RESULT_FILE_DIR} > ${TEST_RESULT_FILE_DIR_FILE}
exit ${PUBLISH_TYPE_AND_RESULT_DIR}
