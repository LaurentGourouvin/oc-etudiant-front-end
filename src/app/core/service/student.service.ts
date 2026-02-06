import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Student } from '../models/Student';
import { StudentRegister } from '../models/StudentRegister';

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

  getStudentById(studentId: number): Observable<Student> {
    return this.httpClient.get<Student>(`/api/student/${studentId}`, {
      headers: { Authorization: 'Bearer ' + this.authService.getToken() },
    });
  }

  createStudent(student: StudentRegister): Observable<Object> {
    return this.httpClient.post<Object>('/api/student', student, {
      headers: { Authorization: 'Bearer ' + this.authService.getToken() },
    });
  }

  deleteStudent(studentId: number): Observable<Object> {
    return this.httpClient.delete(`/api/student/${studentId}`, {
      headers: { Authorization: 'Bearer ' + this.authService.getToken() },
    });
  }
}
