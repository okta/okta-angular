import { Directive, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { OktaAuthStateService, Groups } from './services/auth-state.service';

@Directive({ selector: '[oktaHasAnyGroup]'})
export class OktaHasAnyGroupDirective {
  #templateRef = inject(TemplateRef);
  #viewContainer = inject(ViewContainerRef);
  #authStateService = inject(OktaAuthStateService);

  oktaHasAnyGroup = input.required<Groups>();

  private subscription = toObservable(this.oktaHasAnyGroup).pipe(
    switchMap(groups => this.#authStateService.hasAnyGroups(groups)),
    takeUntilDestroyed()
  ).subscribe(isAuthorized => {
    this.#viewContainer.clear();
    if (isAuthorized) {
      this.#viewContainer.createEmbeddedView(this.#templateRef);
    }
  });
}