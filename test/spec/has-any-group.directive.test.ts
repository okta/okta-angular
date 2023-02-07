import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from "@angular/platform-browser";
import { of } from 'rxjs';
import { OktaHasAnyGroupDirective } from '../../projects/okta-angular/src/okta/has-any-group.directive';
import { OktaAuthStateService } from '../../projects/okta-angular/src/okta-angular';

@Component({ 
  template: `
  <div *oktaHasAnyGroup="['test']">
    <div id="content">In group</div>
  </div>
  ` 
})
class MockComponent {}

function setup(oktaAuthStateService: OktaAuthStateService) {
  TestBed.configureTestingModule({
    declarations: [ 
      OktaHasAnyGroupDirective,
      MockComponent
    ],
    providers: [{
      provide: OktaAuthStateService,
      useValue: oktaAuthStateService
    }],
  });
  return TestBed.createComponent(MockComponent);
}

describe('OktaHasNayGroup Directive', () => {
  it('displays text when group matches', () => {
    const oktaAuthStateService = {
      hasAnyGroups: jest.fn().mockImplementation(() => of(true))
    } as unknown as OktaAuthStateService;
    const fixture = setup(oktaAuthStateService);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css('#content'));
    expect(contentEl.nativeElement.textContent).toBe('In group');
  });

  it('should not display text when not matches', () => {
    const oktaAuthStateService = {
      hasAnyGroups: jest.fn().mockImplementation(() => of(false))
    } as unknown as OktaAuthStateService;
    const fixture = setup(oktaAuthStateService);
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(By.css('#content'));
    expect(contentEl).toBeFalsy();
  });
});
