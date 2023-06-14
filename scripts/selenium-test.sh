#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 85.0.4183.102-1

cd /root/okta/okta-angular

export clientId=0oapmwm72082GXal14x6
export yourOktaDomain=samples-javascript.okta.com
echo "export const environment = {production: false,clientId: '$clientId',yourOktaDomain:'$yourOktaDomain'};" > environment.ts
cat environment.ts

docker-compose up -d
sleep 120

cd /root/okta/okta-angular/test/selenium-test/selenium
npm install selenium-webdriver
wget https://chromedriver.storage.googleapis.com/85.0.4183.87/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
mv chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver
get_vault_secret_key devex/samples-javascript password SIW_TEST_USER_PASSWORD
export SIW_TEST_USER_EMAIL=george@acme.com
if ! node /root/okta/okta-angular/test/selenium-test/selenium/okta-angular-widget-test.ts; then
  echo "Test failed! Exiting..."
  exit ${TEST_FAILURE}
fi
