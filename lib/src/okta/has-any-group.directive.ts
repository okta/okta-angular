import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
} from "@angular/core";
import { ReplaySubject, Subject } from "rxjs";
import { filter, switchMap, takeUntil } from "rxjs/operators";
import { OktaAuthStateService, Groups } from "./services/auth-state.service";

@Directive({ selector: "[oktaHasAnyGroup]", standalone: true })
export class OktaHasAnyGroupDirective implements OnInit, OnChanges, OnDestroy {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStateService = inject(OktaAuthStateService);

  private groupsSub$: Subject<Groups> = new ReplaySubject<Groups>();
  private destroySub$ = new Subject<void>();

  @Input() oktaHasAnyGroup!: Groups;

  ngOnInit(): void {
    this.groupsSub$
      .pipe(
        filter((groups) => !!groups),
        switchMap((groups) => this.authStateService.hasAnyGroups(groups)),
        takeUntil(this.destroySub$)
      )
      .subscribe((isAuthorized) => {
        this.viewContainer.clear();
        if (isAuthorized) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["oktaHasAnyGroup"].currentValue !==
      changes["oktaHasAnyGroup"].previousValue
    ) {
      this.groupsSub$.next(changes["oktaHasAnyGroup"].currentValue as Groups);
    }
  }

  ngOnDestroy(): void {
    this.destroySub$.next();
    this.destroySub$.complete();
  }
}
