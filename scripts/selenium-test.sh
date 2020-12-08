#!/bin/bash
setup_service xvfb
setup_service google-chrome-stable 83.0.4103.61-1

ls -a
cd /root/okta/okta-angular
ls -a
docker ps -a
docker-compose up -d
docker ps
sleep 420
echo check port
netstat -tulnp
docker ps
docker logs --tail 40 angular_backend
cd /root/okta/okta-angular/test/selenium-test/selenium
pwd
echo npm install selenium-webdriver
npm install selenium-webdriver
ls -a
pwd
wget https://chromedriver.storage.googleapis.com/83.0.4103.39/chromedriver_linux64.zip

echo unzip chromedriver_linux64.zip
unzip chromedriver_linux64.zip

echo mv chromedriver /usr/bin/chromedriver
mv chromedriver /usr/bin/chromedriver

echo chown root:root /usr/bin/chromedriver
chown root:root /usr/bin/chromedriver

echo chmod +x /usr/bin/chromedriver
chmod +x /usr/bin/chromedriver

echo pwd
pwd


node /root/okta/okta-angular/test/selenium-test/selenium/okta-angular-widget-test.ts
curl http://localhost:9000/