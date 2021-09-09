import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { OktaAuthStateService, Groups } from './services/auth-state.service';

@Directive({ selector: '[oktaHasAnyGroup]'})
export class OktaHasAnyGroupDirective {
  private previousIsAuthorized: boolean;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authStateService: OktaAuthStateService
  ) { }

  @Input() set oktaHasAnyGroup(groups: Groups) {
    this.authStateService.hasAnyGroups(groups)
      .subscribe(isAuthorized => {
        // not update UI if no state change
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
