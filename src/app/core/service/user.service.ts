import { Injectable } from '@angular/core';
import { Register } from '../models/Register';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../models/Login';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) {}

  // memo: HttpClient is configure by a proxy in proxy.conf.json
  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  login(credentials: Login): Observable<Object> {
    return this.httpClient.post('/api/login', credentials);
  }
}
