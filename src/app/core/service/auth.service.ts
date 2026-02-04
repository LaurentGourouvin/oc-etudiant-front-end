import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    if (!this.getToken()) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(this.getToken()!.split('.')[1]));
      const exp = payload.exp * 1000;
      return exp > Date.now();
    } catch (e) {
      return false;
    }
  }
}
