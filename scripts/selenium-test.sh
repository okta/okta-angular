#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 83.0.4103.61-1

cd /root/okta/okta-angular

docker-compose up -d
sleep 360

docker ps
docker logs --tail 40 angular_backend
cd /root/okta/okta-angular/test/selenium-test/selenium
npm install selenium-webdriver
wget https://chromedriver.storage.googleapis.com/83.0.4103.39/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
mv chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver
get_secret prod/devex/SIWTestUserPassword SIW_TEST_USER_PASSWORD
if ! node /root/okta/okta-angular/test/selenium-test/selenium/okta-angular-widget-test.ts; then
  echo "Test failed! Exiting..."
  exit ${TEST_FAILURE}
fi
