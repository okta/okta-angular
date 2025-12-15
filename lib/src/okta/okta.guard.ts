import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
  CanActivateFn,
  CanActivateChildFn,
  CanMatchFn,
} from '@angular/router';
import { inject } from '@angular/core';
import { OktaAuthGuardService } from './okta-auth-guard.service';

/**
 * Guard fonctionnel pour canActivate
 */
export const oktaCanActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const guard = inject(OktaAuthGuardService);
  return guard.canActivate(route, state);
};

/**
 * Guard fonctionnel pour canActivateChild
 */
export const oktaCanActivateChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const guard = inject(OktaAuthGuardService);
  return guard.canActivateChild(route, state);
};

/**
 * Guard fonctionnel pour remplacer l'ancien CanLoad => CanMatch
 */
export const oktaCanMatch: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  const guard = inject(OktaAuthGuardService);
  return guard.canMatch(route, segments);
};
