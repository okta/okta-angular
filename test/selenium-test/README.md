# Test project selenium-test-angular

This project created to test okta-angular lib.

It consists of:
* Dockerfile
* /sign-in-widget/*
* /selenium/okta-angular-widget-test.js
* docker-compose.yml

# Dockerfile
Creates a new container with nodejs and 
creates simple angular application with integreted okta-angular lib.
All steps are described in https://developer.okta.com/code/angular/okta_angular_sign-in_widget/.

# sign-in-widget folder
Contains all required files from "Create routes" and "Connect routes" sections.
https://developer.okta.com/code/angular/okta_angular_sign-in_widget/, that needed for the app.

# selenium/okta-angular-widget-test.js
Selenium test script for the app, that authenticates test-user.

# docker-compose.yml
Bind ports, start the application and do the healthcheck.
App starts on http://localhost:9000/.

# Local run
Before start needs to be installed:
> NodeJS
>
> Docker


To run test locally you need to execute commands:   
```docker-compose up``` -  will start application on http://localhost:9000/
```node /selenium/okta-angular-widget-test.js```  - will run selenium test.
