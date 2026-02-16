import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // Helper pour générer un "JWT" fake : header.payload.signature
  // Ici on encode juste le payload en base64, comme ton service le lit via atob(...split('.')[1])
  const makeTokenWithPayload = (payload: object) => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'fake-signature';
    return `${header}.${body}.${signature}`;
  };

  beforeEach(() => {
    service = new AuthService();

    // Nettoyage localStorage avant chaque test
    localStorage.clear();

    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000); // une date fixe
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('token storage', () => {
    it('setToken should store token in localStorage', () => {
      service.setToken('my-token');
      expect(localStorage.getItem('auth_token')).toBe('my-token');
    });

    it('getToken should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token');
      expect(service.getToken()).toBe('stored-token');
    });

    it('clearToken should remove token from localStorage', () => {
      localStorage.setItem('auth_token', 'stored-token');
      service.clearToken();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when token is valid (exp in the future)', () => {
      const nowMs = Date.now();
      const expFutureSeconds = Math.floor((nowMs + 60_000) / 1000); // +1 minute

      const token = makeTokenWithPayload({ exp: expFutureSeconds });
      service.setToken(token);

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when token is expired (exp in the past)', () => {
      const nowMs = Date.now();
      const expPastSeconds = Math.floor((nowMs - 60_000) / 1000); // -1 minute

      const token = makeTokenWithPayload({ exp: expPastSeconds });
      service.setToken(token);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when token is malformed (missing parts)', () => {
      service.setToken('not-a-jwt');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when payload is not valid base64 / not decodable', () => {
      // header + "." + payload (invalide) + ".sig"
      service.setToken('aaa.bbb-###.ccc');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when payload is not valid JSON', () => {
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const body = btoa('NOT_JSON');
      service.setToken(`${header}.${body}.sig`);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when payload has no exp', () => {
      const token = makeTokenWithPayload({ foo: 'bar' });
      service.setToken(token);

      expect(service.isAuthenticated()).toBe(false);
    });
  });
});
