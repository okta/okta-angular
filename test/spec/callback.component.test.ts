/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OktaAuth } from '@okta/okta-auth-js';
import {
  OKTA_CONFIG,
  OKTA_AUTH,
  OktaCallbackComponent
} from '../../src/okta-angular';

describe('OktaCallbackComponent', () => {
  let component: OktaCallbackComponent;
  let fixture: ComponentFixture<OktaCallbackComponent>;
  let oktaAuth: OktaAuth;
  let originalLocation: Location;
  beforeEach(() => {
    originalLocation = window.location;
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
    oktaAuth = {
      handleLoginRedirect: jest.fn(),
      idx: {
        isInteractionRequiredError: jest.fn()
      }
    } as unknown as OktaAuth;

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }])
      ],
      declarations: [
        OktaCallbackComponent
      ],
      providers: [
        {
          provide: OKTA_CONFIG,
          useValue: config
        },
        {
          provide: OKTA_AUTH,
          useValue: oktaAuth
        },
      ],
    });
    fixture = TestBed.createComponent(OktaCallbackComponent);
    component = fixture.componentInstance;
  }

  it('should create the component', async(() => {
    bootstrap();
    expect(component).toBeTruthy();
  }));

  it('should call handleLoginRedirect', async(() => {
    bootstrap();
    jest.spyOn(oktaAuth, 'handleLoginRedirect').mockReturnValue(Promise.resolve());
    fixture.detectChanges();
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalled();
  }));

  it('catches errors from handleLoginRedirect', async(() => {
    bootstrap();
    const error = new Error('test error');
    jest.spyOn(oktaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
    fixture.detectChanges();
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalled();
    fixture.whenStable().then(() => {
      expect(component.error).toBe('Error: test error');
    });
  }));

  describe('interaction code flow', () => {
    it('will call `onAuthResume` function, if defined', async(() => {
      const onAuthResume = jest.fn();
      bootstrap({ onAuthResume });
      const error = new Error('my fake error');
      jest.spyOn(oktaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(oktaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(onAuthResume).toHaveBeenCalledWith(oktaAuth, (component as any).injector);
        expect(component.error).toBe(undefined);
      });
    }));

    it('will call `onAuthRequired` function, if `onAuthResume` is not defined', async(() => {
      const onAuthRequired = jest.fn();
      bootstrap({ onAuthRequired });
      const error = new Error('my fake error');
      jest.spyOn(oktaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(oktaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth, (component as any).injector);
        expect(component.error).toBe(undefined);
      });
    }));

    it('if neither `onAuthRequired` or `onAuthResume` are defined, the error is displayed', async(() => {
      bootstrap();
      const error = new Error('my fake error');
      jest.spyOn(oktaAuth, 'handleLoginRedirect').mockReturnValue(Promise.reject(error));
      jest.spyOn(oktaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
        expect(component.error).toBe('Error: my fake error');
      });
    }));
  });
});
