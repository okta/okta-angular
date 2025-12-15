import { Injectable, Injector, inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  NavigationStart,
  Event,
  Route,
  UrlSegment,
  Data,
} from "@angular/router";
import { filter, tap } from "rxjs/operators";

import { AuthState, TokenParams } from "@okta/okta-auth-js";
import { OktaAuthConfigService } from "./services/auth-config.service";
import { AuthRequiredFunction, OKTA_AUTH } from "./models/okta.config";

@Injectable()
export class OktaAuthGuardService {
  private readonly oktaAuth = inject(OKTA_AUTH);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly configService = inject(OktaAuthConfigService);

  private state?: RouterStateSnapshot;
  private routeData?: Data;
  private onAuthRequired?: AuthRequiredFunction;

  constructor() {
    const config = this.configService.getConfig();
    if (!config) {
      throw new Error("Okta config is not provided");
    }
    this.onAuthRequired = config.onAuthRequired;

    // Unsubscribe updateAuthStateListener quand la route change
    this.router.events
      .pipe(
        filter(
          (e: Event) =>
            e instanceof NavigationStart &&
            !!(this.state && this.state.url !== (e as NavigationStart).url)
        ),
        tap(() =>
          this.oktaAuth.authStateManager.unsubscribe(
            this.updateAuthStateListener
          )
        )
      )
      .subscribe();
  }

  /**
   * Équivalent de ton ancien canActivate
   */
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    this.state = state;
    this.routeData = route.data;
    this.onAuthRequired = route.data?.onAuthRequired || this.onAuthRequired;

    // Surveiller l'état d'auth une fois sur la route
    this.oktaAuth.authStateManager.subscribe(this.updateAuthStateListener);

    const isAuthenticated = await this.isAuthenticated(route.data);
    if (isAuthenticated) {
      return true;
    }

    await this.handleLogin(state.url, route.data);
    return false;
  }

  async canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return this.canActivate(route, state);
  }

  /**
   * Remplace ton ancien canLoad avec un canMatch fonctionnel
   */
  async canMatch(route: Route, segments: UrlSegment[]): Promise<boolean> {
    this.routeData = route.data;
    this.onAuthRequired = route.data?.onAuthRequired || this.onAuthRequired;

    const isAuthenticated = await this.isAuthenticated(route.data);
    if (isAuthenticated) {
      return true;
    }

    // Equivalent d'originalUri
    let originalUri = "/" + segments.map((s) => s.path).join("/");

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extractedUrl) {
      originalUri = navigation.extractedUrl.toString();
    }

    await this.handleLogin(originalUri, route.data);
    return false;
  }

  // ---- Méthodes privées identiques à ton implé ----

  private async isAuthenticated(
    routeData?: Data,
    authState?: AuthState | null
  ): Promise<boolean> {
    const isAuthenticated = authState
      ? !!authState.isAuthenticated
      : await this.oktaAuth.isAuthenticated();

    let res = isAuthenticated;

    if (routeData?.okta?.acrValues) {
      if (!authState) {
        authState = this.oktaAuth.authStateManager.getAuthState();
      }
      res = authState?.idToken?.claims.acr === routeData.okta.acrValues;
    }

    return res;
  }

  private async handleLogin(
    originalUri?: string,
    routeData?: Data
  ): Promise<void> {
    if (originalUri) {
      this.oktaAuth.setOriginalUri(originalUri);
    }

    const options: TokenParams = {};
    if (routeData?.okta?.acrValues) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore auth-js >= 7.1.0
      options.acrValues = routeData.okta.acrValues;
    }

    if (this.onAuthRequired) {
      this.onAuthRequired(this.oktaAuth, this.injector, options);
    } else {
      this.oktaAuth.signInWithRedirect(options);
    }
  }

  private updateAuthStateListener = async (authState: AuthState) => {
    const isAuthenticated = await this.isAuthenticated(
      this.routeData,
      authState
    );
    if (!isAuthenticated && this.state) {
      await this.handleLogin(this.state.url, this.routeData);
    }
  };
}
