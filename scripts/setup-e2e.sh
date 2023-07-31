#!/bin/bash -xe

DIR=$(cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd)
source $DIR/utils/local.sh
source $DIR/utils/siw-platform-scripts.sh

# Can be used to run a canary build against a beta AuthJS version that has been published to artifactory.
# This is available from the "downstream artifact" menu on any okta-auth-js build in Bacon.
# DO NOT MERGE ANY CHANGES TO THIS LINE!!
export AUTHJS_VERSION="7.5.0-g8d01538"

# Install a specific version of auth-js, used by downstream artifact builds
install_auth_js () {
  if [ ! -z "$AUTHJS_VERSION" ]; then
    echo "Installing AUTHJS_VERSION for $1: ${AUTHJS_VERSION}"
    install_siw_platform_scripts
    install_artifact @okta/okta-auth-js "${AUTHJS_VERSION}"
    echo "AUTHJS_VERSION installed for $1: ${AUTHJS_VERSION}"

    # verify single version of auth-js is installed
    # NOTE: okta-signin-widget will install it's own version of auth-js, filtered out
    exclude=""
    if [ "$1" == "root" ]; then
      exclude="-not -path */test/apps/angular-*/*"
    fi
    AUTHJS_INSTALLS=$(find . -type d -path "*/node_modules/@okta/okta-auth-js" -not -path "*/okta-signin-widget/*" ${exclude} | wc -l)
    if [ $AUTHJS_INSTALLS -gt 1 ]; then
      echo "ADDITIONAL AUTH JS INSTALL DETECTED"
      yarn why @okta/okta-auth-js
      exit ${FAILED_SETUP}
    fi
  fi
}

# Install required node version
export NVM_DIR="/root/.nvm"
setup_service node v16.13.2

# Install yarn
# Use the cacert bundled with centos as okta root CA is self-signed and cause issues downloading from yarn
setup_service yarn 1.21.1 /etc/pki/tls/certs/ca-bundle.crt

# Add yarn to the $PATH so npm cli commands do not fail
export PATH="${PATH}:$(yarn global bin)"

yarn global add yalc

cd ${OKTA_HOME}/${REPO}

# if running on bacon
if [ -n "${TEST_SUITE_ID}" ]; then
  # undo permissions change on scripts/publish.sh
  git checkout -- scripts

  # ensure we're in a branch on the correct sha
  git checkout $BRANCH
  git reset --hard $SHA

  git config --global user.email "oktauploader@okta.com"
  git config --global user.name "oktauploader-okta"
fi

# Install dependencies but do not build
if ! yarn install --frozen-lockfile --ignore-scripts; then
  echo "yarn install failed! Exiting..."
  exit ${FAILED_SETUP}
fi

# Install a specific version of auth-js
install_auth_js "root"

# Build
if ! yarn build; then
  echo "yarn build failed! Exiting..."
  exit ${FAILED_SETUP}
fi


# Install dependencies for test apps
yarn test:apps:prepare
for app in test/apps/angular-*
do
  pushd $app
    yarn install
    install_auth_js $app
  popd
done
