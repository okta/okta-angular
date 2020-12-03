#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 83.0.4103.61-1

ls -a
cd /root/okta/okta-angular
ls -a
docker ps -a
docker-compose up -d
docker ps
sleep 300
docker ps
docker logs --tail 40 angular_backend
cd /root/okta/okta-angular/test/selenium-test/selenium
pwd
npm install selenium-webdriver
echo here
ls -a
pwd
wget https://chromedriver.storage.googleapis.com/83.0.4103.39/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
mv chromedriver /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver
pwd
node /root/okta/okta-angular/test/selenium-test/selenium/okta-angular-widget-test.ts
