import { Directive, Input, TemplateRef, ViewContainerRef, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { OktaAuthStateService, Groups } from './services/auth-state.service';

@Directive({ selector: '[oktaHasAnyGroup]'})
export class OktaHasAnyGroupDirective implements OnChanges, OnDestroy {
  private previousIsAuthorized: boolean;
  private hasAnyGroups$: Subscription;
  private groups: Groups;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authStateService: OktaAuthStateService
  ) { }

  ngOnDestroy(): void {
    if (this.hasAnyGroups$) {
      this.hasAnyGroups$.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.oktaHasAnyGroup.currentValue !== changes.oktaHasAnyGroup.previousValue) {
      this.subscribeToAnyGroups();
    }
  }

  subscribeToAnyGroups() {
    if (this.hasAnyGroups$) {
      this.hasAnyGroups$.unsubscribe();
    }

    this.hasAnyGroups$ = this.authStateService.hasAnyGroups(this.groups)
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

  @Input() set oktaHasAnyGroup(groups: Groups) {
    this.groups = groups;
    // this.hasAnyGroups$ = this.authStateService.hasAnyGroups(groups)
    //   .subscribe(isAuthorized => {
    //     // don't update UI if no state change
    //     if (isAuthorized === this.previousIsAuthorized) {
    //       return;
    //     }
    //     this.previousIsAuthorized = isAuthorized;
    //     this.viewContainer.clear();
    //     if (isAuthorized) {
    //       this.viewContainer.createEmbeddedView(this.templateRef);
    //     }
    //   });
  }
}
