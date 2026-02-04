import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Student } from '../models/Student';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
  ) {}

  getAllStudents(): Observable<Student[]> {
    return this.httpClient.get<Student[]>('/api/student', {
      headers: { Authorization: 'Bearer ' + this.authService.getToken() },
    });
  }
}
