/*eslint import/no-unresolved: [2, { ignore: ['@okta/okta-angular$'] }]*/
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {
  OktaAuthModule,
} from '@okta/okta-angular';
import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';

const mockAccessToken = `
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXIiOj
EsImp0aSI6IkFULnJ2Ym5TNGlXdTJhRE5jYTNid1RmMEg5Z
VdjV2xsS1FlaU5ZX1ZlSW1NWkEiLCJpc3MiOiJodHRwczov
L2F1dGgtanMtdGVzdC5va3RhLmNvbS9vYXV0aDIvYXVzOGF
1czc2cThpcGh1cEQwaDciLCJhdWQiOiJodHRwOi8vZXhhbX
BsZS5jb20iLCJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRV
iIsImlhdCI6MTQ2ODQ2NzY0NywiZXhwIjoxNDY4NDcxMjQ3
LCJjaWQiOiJQZjBhaWZyaFladTF2MFAxYkZGeiIsInVpZCI
6IjAwdTFwY2xhNXFZSVJFRExXQ1FWIiwic2NwIjpbIm9wZW
5pZCIsImVtYWlsIl19.ziKfS8IjSdOdTHCZllTDnLFdE96U
9bSIsJzI0MQ0zlnM2QiiA7nvS54k6Xy78ebnkJvmeMCctjX
VKkJOEhR6vs11qVmIgbwZ4--MqUIRU3WoFEsr0muLl039Qr
Ua1EQ9-Ua9rPOMaO0pFC6h2lfB_HfzGifXATKsN-wLdxk6c
gA`.replace(/\n/g, '');
const standardAccessTokenParsed = {
  accessToken: mockAccessToken,
  expiresAt: new Date().getTime() + 100, // ensure token is active
  scopes: ['openid', 'email'],
  tokenType: 'Bearer',
  authorizeUrl: process.env['ISSUER'] + '/oauth2/v1/authorize',
  userinfoUrl: process.env['ISSUER'] + '/oauth2/v1/userinfo'
};

const mockIdToken =
  `eyJhbGciOiJSUzI1NiIsImtpZCI6IlU1UjhjSGJHdzQ0NVFicTh6Vk8xUGNDcFhMOHlHNkljb3ZWYTNsYUNveE0i
  fQ.eyJzdWIiOiIwMHUxcGNsYTVxWUlSRURMV0NRViIsIm5hbWUiOiJTYW1sIEphY2tzb24iLCJnaXZlbl9uYW1lIjoiU2FtbCIsImZhbWlseV9u
  YW1lIjoiSmFja3NvbiIsInVwZGF0ZWRfYXQiOjE0NDYxNTM0MDEsImVtYWlsIjoic2FtbGphY2tzb25Ab2t0YS5jb20iLCJlbWFpbF92ZXJpZml
  lZCI6dHJ1ZSwidmVyIjoxLCJpc3MiOiJodHRwczovL2F1dGgtanMtdGVzdC5va3RhLmNvbSIsImxvZ2luIjoiYWRtaW5Ab2t0YS5jb20iLCJub2
  5jZSI6ImFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWEiLCJhdWQiOiJOUFNmT
  2tINWVaclR5OFBNRGx2eCIsImlhdCI6MTQ0OTY5NjMzMCwiZXhwIjoxNDQ5Njk5OTMwLCJhbXIiOlsia2JhIiwibWZhIiwicHdkIl0sImp0aSI6
  IlRSWlQ3UkNpU3ltVHM1VzdSeWgzIiwiYXV0aF90aW1lIjoxNDQ5Njk2MzMwfQ.tdspicRE-0IrFKwjCT2Uo2gExQyTAftcp4cuA3iIF6_uYiqQ
  9Q4SZHCjMbuWdXrUSM-_UkDpD6sbG_ZRcdZQJ7geeIEjKpV4x792iiP_f1H-HLbAMIDWynp5FR4QQO1Q4ndNOwIsrUqf06vYazz9ildQde2uOTw
  caUCsz2M0lSU`.replace(/\n/g, '');
const standardIdTokenParsed = {
  idToken: mockIdToken,
  expiresAt: new Date().getTime() + 100, // ensure token is active
  scopes: ['openid', 'email'],
  authorizeUrl: process.env['ISSUER'] + '/oauth2/v1/authorize',
  issuer: process.env['ISSUER'],
  clientId: process.env['CLIENT_ID']
};

describe('Unit Tests', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    let testing = {
      disableHttpsCheck: false
    };
    const config: OktaAuthOptions = {
      issuer: process.env['ISSUER']!,
      redirectUri: process.env['REDIRECT_URI'],
      clientId: process.env['CLIENT_ID'],
      scopes: ['email'],
      responseType: 'id_token',
      tokenManager: {
        syncStorage: false
      }
    };

    const oktaAuth = new OktaAuth(config);

    if (process.env['OKTA_TESTING_DISABLEHTTPSCHECK']) {
      testing = {
        disableHttpsCheck: true
      };
    }

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'foo', redirectTo: '/foo' }]),
        OktaAuthModule.forRoot({oktaAuth, testing})
      ],
      declarations: [ 
        AppComponent
      ],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    localStorage.clear();
  });

  it('should create the app', (() => {
    expect(component).toBeTruthy();
  }));

  it('can retrieve an accessToken and idToken from the tokenManager', async () => {
    // Store tokens
    localStorage.setItem(
      'okta-token-storage',
      JSON.stringify({
        'accessToken': standardAccessTokenParsed,
        'idToken': standardIdTokenParsed
      }),
    );
    const accessToken = await component.oktaAuth.getAccessToken();
    expect(accessToken).toBe(mockAccessToken);
    const idToken = await component.oktaAuth.getIdToken();
    expect(idToken).toBe(mockIdToken);
  });

  it('isAuthenticated() returns true when the TokenManager returns an access token and id token', async () => {
    // Store tokens
    localStorage.setItem(
      'okta-token-storage',
      JSON.stringify({
        'accessToken': standardAccessTokenParsed,
        'idToken': standardIdTokenParsed
      }),
    );
    const authenticated = await component.oktaAuth.isAuthenticated();
    expect(authenticated).toBeTruthy();
  });

  it('isAuthenticated() returns false when the TokenManager does not return an access token or an id token', async () => {
    // Don't store tokens
    const authenticated = await component.oktaAuth.isAuthenticated();
    expect(authenticated).toBeFalsy();
  });
});
