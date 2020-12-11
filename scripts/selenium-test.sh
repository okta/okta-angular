#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 83.0.4103.61-1

cd /root/okta/okta-angular

docker-compose up -d
sleep 300

docker ps
docker logs --tail 40 angular_backend
cd /root/okta/okta-angular/test/selenium-test/selenium
npm install selenium-webdriver
wget https://chromedriver.storage.googleapis.com/83.0.4103.39/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
get_secret prod/devex/SIWTestUserPassword SIWTestUserPassword
mv chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver
node /root/okta/okta-angular/test/selenium-test/selenium/okta-angular-widget-test.ts
curl http://localhost:9000/

printenv