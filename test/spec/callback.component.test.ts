import { TestBed, ComponentFixture } from '@angular/core/testing';
import { OktaAuth } from '@okta/okta-auth-js';
import {
  OktaCallbackComponent,
  OktaAuthConfigService,
  OKTA_AUTH
} from '../../lib/src/okta-angular';

describe('OktaCallbackComponent', () => {
  let component: OktaCallbackComponent;
  let fixture: ComponentFixture<OktaCallbackComponent>;
  const oktaAuth = {
    handleLoginRedirect: jest.fn(),
    idx: {
      isInteractionRequiredError: jest.fn()
    }
  } as unknown as OktaAuth;

  const configService = {
    getConfig: jest.fn().mockReturnValue({})
  };

  beforeEach( () => {
    TestBed.configureTestingModule({
      declarations: [OktaCallbackComponent],
      providers: [
        { provide: OktaAuthConfigService, useValue: configService },
        { provide: OKTA_AUTH, useValue: oktaAuth }
      ]
    });

    fixture = TestBed.createComponent(OktaCallbackComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call handleLoginRedirect', () => {
     jest.spyOn(oktaAuth, 'handleLoginRedirect');
    fixture.detectChanges();
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalled();
  });

  it('catches errors from handleLoginRedirect', async () => {
    const error = new Error('test error');
    jest.spyOn(oktaAuth, 'handleLoginRedirect').mockRejectedValue(error);
    fixture.detectChanges();

    await expect(oktaAuth.handleLoginRedirect).rejects.toThrow('test error');  
    expect(component.error).toBe('Error: test error');
  });

  describe('interaction code flow', () => {

    it('will call `onAuthResume` function, if defined', async () => {
      const onAuthResume = jest.fn();
      jest.spyOn(configService, 'getConfig').mockReturnValue({onAuthResume});
      const error = new Error('my fake error');
      jest.spyOn(oktaAuth, 'handleLoginRedirect').mockRejectedValue(error);
      jest.spyOn(oktaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(onAuthResume).toHaveBeenCalledWith(oktaAuth, (component as any).injector);
      expect(component.error).toBe(undefined);
    });

    it('will call `onAuthRequired` function, if `onAuthResume` is not defined', async () => {
      const onAuthRequired = jest.fn();
      jest.spyOn(configService, 'getConfig').mockReturnValue({onAuthRequired});
      const error = new Error('my fake error');
      jest.spyOn(oktaAuth, 'handleLoginRedirect').mockRejectedValue(error);
      jest.spyOn(oktaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(onAuthRequired).toHaveBeenCalledWith(oktaAuth, (component as any).injector);
      expect(component.error).toBe(undefined);
    });

    it('if neither `onAuthRequired` or `onAuthResume` are defined, the error is displayed', async () => {  
      const error = new Error('my fake error');
      jest.spyOn(oktaAuth, 'handleLoginRedirect').mockRejectedValue(error);
      jest.spyOn(oktaAuth.idx, 'isInteractionRequiredError').mockReturnValue(true);
      jest.spyOn(configService, 'getConfig').mockReturnValue({});
      fixture.detectChanges();
      await fixture.whenStable();
      expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(error);
      expect(component.error).toBe('Error: my fake error');
    });
  });
});
