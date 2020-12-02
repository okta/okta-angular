FROM node:14.15.0-alpine3.12
RUN npm install -g @angular/cli@11.0.1

RUN ng new okta-app --routing
RUN cd okta-app

RUN npm i rxjs
RUN npm install @angular/core@11.0.1
RUN npm install @angular/router
RUN npm i @angular/common

RUN npm install @okta/okta-signin-widget
WORKDIR ../

ADD . / okta-angular/

WORKDIR okta-angular
RUN rm -rf node_modules
RUN yarn install
RUN yarn build
RUN yarn link
WORKDIR ../
WORKDIR okta-app
RUN yarn install
RUN yarn link @okta/okta-angular


COPY /test/selenium-test/sign-in-widget/app.module.ts /okta-app/src/app
COPY /test/selenium-test/sign-in-widget/app.component.html /okta-app/src/app
COPY /test/selenium-test/sign-in-widget/app.component.ts /okta-app/src/app
COPY /test/selenium-test/sign-in-widget/protected.component.ts /okta-app/src/app
COPY /test/selenium-test/sign-in-widget/login.component.ts /okta-app/src/app
COPY /test/selenium-test/tsconfig.json /okta-app
