FROM node:14.15.0-alpine3.12
RUN node -v
RUN npm install -g @angular/cli
RUN npm install @angular/core
RUN npm i rxjs
RUN npm install @angular/router
RUN npm i @angular/common
RUN ng new okta-app --routing
RUN cd okta-app
RUN npm install @okta/okta-signin-widget
RUN npm install @okta/okta-angular


COPY /sign-in-widget/app.module.ts /okta-app/src/app
COPY /sign-in-widget/app.component.html /okta-app/src/app
COPY /sign-in-widget/app.component.ts /okta-app/src/app
COPY /sign-in-widget/protected.component.ts /okta-app/src/app
COPY /sign-in-widget/login.component.ts /okta-app/src/app
WORKDIR okta-app
