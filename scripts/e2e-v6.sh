#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup-e2e.sh

setup_service java 1.8.222
setup_service google-chrome-stable 106.0.5249.61-1

export TEST_SUITE_TYPE="junit"
export TEST_RESULT_FILE_DIR="${REPO}/test-reports/e2e"

export ISSUER=https://samples-javascript.okta.com/oauth2/default
export SPA_CLIENT_ID=0oapmwm72082GXal14x6
export WEB_CLIENT_ID=0oapmx9r5dK1dDAd54x6
export USERNAME=george@acme.com
get_secret prod/okta-sdk-vars/client_secret CLIENT_SECRET
get_secret prod/okta-sdk-vars/password PASSWORD

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
