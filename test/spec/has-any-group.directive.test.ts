import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { OktaHasAnyGroupDirective } from "../../lib/src/okta/has-any-group.directive";
import { OktaAuthStateService } from "../../lib/src/okta-angular";

@Component({
  standalone: true,
  imports: [OktaHasAnyGroupDirective],
  template: `
    <div *oktaHasAnyGroup="['test']">
      <div id="content">In group</div>
    </div>
  `,
})
class MockComponent {}

describe("OktaHasNayGroup Directive", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: OktaAuthStateService,
          useValue: {},
        },
      ],
    });
  });

  it("displays text when group matches", () => {
    const oktaAuthStateService = {
      hasAnyGroups: jest.fn().mockImplementation(() => of(true)),
    } as unknown as OktaAuthStateService;
    TestBed.overrideProvider(OktaAuthStateService, {
      useValue: oktaAuthStateService,
    });
    const fixture = TestBed.createComponent(MockComponent);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css("#content"));
    expect(contentEl.nativeElement.textContent).toBe("In group");
  });

  it("should not display text when not matches", () => {
    const oktaAuthStateService = {
      hasAnyGroups: jest.fn().mockImplementation(() => of(false)),
    } as unknown as OktaAuthStateService;
    TestBed.overrideProvider(OktaAuthStateService, {
      useValue: oktaAuthStateService,
    });
    const fixture = TestBed.createComponent(MockComponent);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css("#content"));
    expect(contentEl).toBeFalsy();
  });
});
