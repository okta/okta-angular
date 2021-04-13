/* eslint-disable @typescript-eslint/no-explicit-any */
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
  });
  afterEach(() => {
    window.location = originalLocation;
  });

  function bootstrap(config = {}) {
    config = Object.assign({
      clientId: 'foo',
      issuer: 'https://foo',
      redirectUri: 'https://foo'
    }, config);

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
  }

  it('should create the component', async(() => {
    bootstrap();
    expect(component).toBeTruthy();
  }));

  it('should call handleLoginRedirect', async(() => {
    bootstrap();
    jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.resolve());
    fixture.detectChanges();
    expect(service.handleLoginRedirect).toHaveBeenCalled();
  }));

  it('catches errors from handleLoginRedirect', async(() => {
    bootstrap();
    const error = new Error('test error');
    jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
    fixture.detectChanges();
    expect(service.handleLoginRedirect).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(component.error).toBe('Error: test error');
    });
  }));

  describe('interaction code flow', () => {
    it('will call `onAuthResume` function, if defined', async(() => {
      const onAuthResume = jest.fn();
      bootstrap({ onAuthResume });
      const error = new Error('my fake error');
      jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(service, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(service.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(onAuthResume).toHaveBeenCalledWith(service, (component as any).injector);
        expect(component.error).toBe(undefined);
      });
    }));

    it('will call `onAuthRequired` function, if `onAuthResume` is not defined', async(() => {
      const onAuthRequired = jest.fn();
      bootstrap({ onAuthRequired });
      const error = new Error('my fake error');
      jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(service, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(service.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(onAuthRequired).toHaveBeenCalledWith(service, (component as any).injector);
        expect(component.error).toBe(undefined);
      });
    }));

    it('if neither `onAuthRequired` or `onAuthResume` are defined, the error is displayed', async(() => {
      bootstrap();
      const error = new Error('my fake error');
      jest.spyOn(service, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(service, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(service.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(component.error).toBe('Error: my fake error');
      });
    }));
  });
});
