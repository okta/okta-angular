import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import {
  OktaAuthService,
  OKTA_CONFIG,
  OktaCallbackComponent
} from '../../src/okta-angular';

describe('OktaCallbackComponent', () => {
  let component: OktaCallbackComponent;
  let fixture: ComponentFixture<OktaCallbackComponent>;
  let service: OktaAuthService;
  let originalLocation: Location;
  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
    (window.location as unknown) = {
      protocol: 'https:',
      replace: jest.fn(),
      // simulate callback
      href: 'https://foo',
      search: '?code=fake'
    };
    const config = {
      clientId: 'foo',
      issuer: 'https://foo',
      redirectUri: 'https://foo'
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }])
      ],
      declarations: [
        OktaCallbackComponent
      ],
      providers: [
        OktaAuthService,
        {
          provide: OKTA_CONFIG,
          useValue: config
        },
      ],
    });
    service = TestBed.get(OktaAuthService);
    fixture = TestBed.createComponent(OktaCallbackComponent);
    component = fixture.componentInstance;
  });
  afterEach(() => {
    window.location = originalLocation;
  });
  it('should create the component', async(() => {
    expect(component).toBeTruthy();
  }));

  it('should call handleLoginRedirect', async(() => {
    jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.resolve());
    fixture.detectChanges();
    expect(service.handleLoginRedirect).toHaveBeenCalled();
  }));

  it('catches errors from handleLoginRedirect', async(() => {
    const error = new Error('test error');
    jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
    fixture.detectChanges();
    expect(service.handleLoginRedirect).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(component.error).toBe('Error: test error');
    });
  }));
});
