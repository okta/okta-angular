#!/bin/bash -x

source ${OKTA_HOME}/${REPO}/scripts/setup.sh

create_log_group "Snyk Scan"
dependency_scan --exclude=dist
finish_log_group $?
