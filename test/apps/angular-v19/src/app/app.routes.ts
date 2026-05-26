import { Injector } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { SessionTokenLoginComponent } from './sessionToken-login.component';
import { ProtectedComponent } from './protected.component';
import { PublicComponent } from './public.component';
import { HasGroupComponent } from './has-group.component';
import { canActivateAuthGuard, canActivateChildAuthGuard, canMatchAuthGuard, OktaCallbackComponent } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

export function onNeedsAuthenticationGuard(oktaAuth: OktaAuth, injector: Injector) {
  const router = injector.get(Router);
  router.navigate(['/sessionToken-login']);
}

export const routes: Routes = [
  {
    path: 'sessionToken-login',
    component: SessionTokenLoginComponent
  },
  {
    path: 'login/callback',
    component: OktaCallbackComponent
  },
  {
    path: 'protected',
    component: ProtectedComponent,
    canActivate: [ canActivateAuthGuard ],
    children: [
      {
        path: 'foo',
        component: ProtectedComponent
        // protected by canActivate on parent route
      }
    ]
  },
  {
    path: 'protected-with-data',
    component: ProtectedComponent,
    canActivate: [ canActivateAuthGuard ],
    data: {
      onAuthRequired: onNeedsAuthenticationGuard
    }
  },
  {
    path: 'public',
    component: PublicComponent,
    canActivateChild: [ canActivateChildAuthGuard ],
    children: [
      {
        path: 'private',
        component: ProtectedComponent
      },
      {
        path: '2fa',
        component: ProtectedComponent,
        data: {
          okta: {
            acrValues: 'urn:okta:loa:2fa:any'
          }
        },
      },
      {
        path: '1fa',
        component: ProtectedComponent,
        data: {
          okta: {
            acrValues: 'urn:okta:loa:1fa:any'
          }
        },
      }
    ]
  },
  {
    path: 'lazy',
    loadComponent: () => import('./lazy-load/lazy-load.component').then(c => c.LazyLoadComponent),
    canMatch: [ canMatchAuthGuard ]
  },
  {
    path: 'group',
    component: HasGroupComponent,
  },
];
