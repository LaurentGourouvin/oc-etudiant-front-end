import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './AuthGuard';
import { AuthService } from '../core/service/auth.service';

describe('AuthGuard', () => {
  const routerMock = {
    navigateByUrl: jest.fn(),
  };

  const authMock = {
    isAuthenticated: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authMock },
      ],
    });

    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when user is authenticated', () => {
    authMock.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => AuthGuard());

    expect(result).toBe(true);
    expect(authMock.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(window.alert).not.toHaveBeenCalled();
    expect(routerMock.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should alert + redirect to /login and return false when user is not authenticated', () => {
    authMock.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => AuthGuard());

    expect(result).toBe(false);
    expect(authMock.isAuthenticated).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith(
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
