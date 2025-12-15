import { TestBed } from "@angular/core/testing";
import { OktaAuth } from "@okta/okta-auth-js";
import {
  OktaCallbackComponent,
  OktaAuthConfigService,
  OKTA_AUTH,
} from "../../lib/src/okta-angular";

describe("OktaCallbackComponent", () => {
  const oktaAuth = {
    handleLoginRedirect: jest.fn(),
    idx: {
      isInteractionRequiredError: jest.fn(),
    },
  } as unknown as OktaAuth;

  const configService = {
    getConfig: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OktaCallbackComponent],
      providers: [
        { provide: OktaAuthConfigService, useValue: configService },
        { provide: OKTA_AUTH, useValue: oktaAuth },
      ],
    });
  });

  it("should create the component", () => {
    const fixture = TestBed.createComponent(OktaCallbackComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it("should call handleLoginRedirect", () => {
    const fixture = TestBed.createComponent(OktaCallbackComponent);

    jest.spyOn(oktaAuth, "handleLoginRedirect");
    fixture.detectChanges();
    expect(oktaAuth.handleLoginRedirect).toHaveBeenCalled();
  });

  it("catches errors from handleLoginRedirect", async () => {
    const fixture = TestBed.createComponent(OktaCallbackComponent);
    const component = fixture.componentInstance;

    const error = new Error("test error");
    jest.spyOn(oktaAuth, "handleLoginRedirect").mockRejectedValue(error);
    fixture.detectChanges();

    await expect(oktaAuth.handleLoginRedirect).rejects.toThrow("test error");
    expect(component.error()).toBe("Error: test error");
  });

  describe("interaction code flow", () => {
    it("will call `onAuthResume` function, if defined", async () => {
      const fixture = TestBed.createComponent(OktaCallbackComponent);
      const component = fixture.componentInstance;

      const onAuthResume = jest.fn();
      jest.spyOn(configService, "getConfig").mockReturnValue({ onAuthResume });
      const error = new Error("my fake error");
      jest.spyOn(oktaAuth, "handleLoginRedirect").mockRejectedValue(error);
      jest
        .spyOn(oktaAuth.idx, "isInteractionRequiredError")
        .mockReturnValue(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(
        error
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(onAuthResume).toHaveBeenCalledWith(
        oktaAuth,
        (component as any).injector
      );
      expect(component.error()).toBe(undefined);
    });

    it("will call `onAuthRequired` function, if `onAuthResume` is not defined", async () => {
      const fixture = TestBed.createComponent(OktaCallbackComponent);
      const component = fixture.componentInstance;

      const onAuthRequired = jest.fn();
      jest
        .spyOn(configService, "getConfig")
        .mockReturnValue({ onAuthRequired });
      const error = new Error("my fake error");
      jest.spyOn(oktaAuth, "handleLoginRedirect").mockRejectedValue(error);
      jest
        .spyOn(oktaAuth.idx, "isInteractionRequiredError")
        .mockReturnValue(true);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(
        error
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(onAuthRequired).toHaveBeenCalledWith(
        oktaAuth,
        (component as any).injector
      );
      expect(component.error()).toBe(undefined);
    });

    it("if neither `onAuthRequired` or `onAuthResume` are defined, the error is displayed", async () => {
      const fixture = TestBed.createComponent(OktaCallbackComponent);
      const component = fixture.componentInstance;

      const error = new Error("my fake error");
      jest.spyOn(oktaAuth, "handleLoginRedirect").mockRejectedValue(error);
      jest
        .spyOn(oktaAuth.idx, "isInteractionRequiredError")
        .mockReturnValue(true);
      jest.spyOn(configService, "getConfig").mockReturnValue({});
      fixture.detectChanges();
      await fixture.whenStable();
      expect(oktaAuth.idx.isInteractionRequiredError).toHaveBeenCalledWith(
        error
      );
      expect(component.error()).toBe("Error: my fake error");
    });
  });
});
