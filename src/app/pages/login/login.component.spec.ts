import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';
import { AuthService } from '../../core/service/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;

  const userServiceMock = {
    login: jest.fn(),
  };

  const authServiceMock = {
    setToken: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],

      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // déclenche ngOnInit()
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should init form with login/password required', () => {
    // GIVEN/WHEN done in beforeEach

    // THEN
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('login')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();

    // Validators.required => empty => invalid
    component.loginForm.patchValue({ login: '', password: '' });
    expect(component.loginForm.invalid).toBe(true);
  });

  it('should not call login when form is invalid', () => {
    // GIVEN: form vide
    component.loginForm.patchValue({ login: '', password: '' });

    // WHEN
    component.onSubmit();

    // THEN
    expect(component.submitted).toBe(true);
    expect(userServiceMock.login).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should login successfully, store token and navigate to dashboard', () => {
    // GIVEN
    userServiceMock.login.mockReturnValue(of({ token: 'fake.jwt.token' }));

    component.loginForm.patchValue({ login: 'login', password: 'password' });

    // WHEN
    component.onSubmit();

    // THEN
    expect(component.submitted).toBe(true);
    expect(component.loading).toBe(false);
    expect(userServiceMock.login).toHaveBeenCalledTimes(1);
    expect(userServiceMock.login).toHaveBeenCalledWith({
      login: 'login',
      password: 'password',
    });

    expect(authServiceMock.setToken).toHaveBeenCalledWith('fake.jwt.token');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.errorMessage).toBeNull();
  });

  it('should set errorMessage when login fails', () => {
    // GIVEN
    userServiceMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } })),
    );

    component.loginForm.patchValue({ login: 'login', password: 'wrong' });

    // WHEN
    component.onSubmit();

    // THEN
    expect(component.submitted).toBe(true);
    expect(component.loading).toBe(false); // finalize() doit repasser à false
    expect(userServiceMock.login).toHaveBeenCalledTimes(1);

    expect(authServiceMock.setToken).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should reset form state on reset', () => {
    // GIVEN
    component.submitted = true;
    component.errorMessage = 'Some error';
    component.loginForm.patchValue({ login: 'a', password: 'b' });

    // WHEN
    component.onReset();

    // THEN
    expect(component.submitted).toBe(false);
    expect(component.errorMessage).toBeNull();
    expect(component.loginForm.get('login')?.value).toBeNull();
    expect(component.loginForm.get('password')?.value).toBeNull();
  });
});
