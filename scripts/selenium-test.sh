#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 85.0.4183.102-1

cd /root/okta/okta-angular

get_secret prod/devex/SIWTestClientId clientId
get_secret prod/devex/SIWTestOktaDomain yourOktaDomain
echo "export const environment = {production: false,clientId: '$clientId',yourOktaDomain:'$yourOktaDomain'};" > environment.ts
cat environment.ts

docker-compose up -d
sleep 120

cd /root/okta/okta-angular/test/selenium-test/selenium
npm install selenium-webdriver
wget https://chromedriver.storage.googleapis.com/87.0.4280.88/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
mv chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver
get_secret prod/devex/SIWTestUserPassword SIW_TEST_USER_PASSWORD
get_secret prod/devex/SIWTestUser SIW_TEST_USER_EMAIL
if ! node /root/okta/okta-angular/test/selenium-test/selenium/okta-angular-widget-test.ts; then
  echo "Test failed! Exiting..."
  exit ${TEST_FAILURE}
fi
