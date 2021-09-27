import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OktaAuthStateService, Groups } from './services/auth-state.service';

@Directive({ selector: '[oktaHasAnyGroup]'})
export class OktaHasAnyGroupDirective {
  private previousIsAuthorized: boolean;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authStateService: OktaAuthStateService
  ) { }

  @Input() set oktaHasAnyGroup(groups: Groups) {
    this.authStateService.hasAnyGroups(groups)
      .subscribe(isAuthorized => {
        // don't update UI if no state change
        if (isAuthorized === this.previousIsAuthorized) {
          return;
        }
        this.previousIsAuthorized = isAuthorized;
        this.viewContainer.clear();
        if (isAuthorized) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }
}
