import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { StudentService } from './student.service';
import { AuthService } from './auth.service';
import { Student } from '../models/Student';
import { StudentRegister } from '../models/StudentRegister';

describe('StudentService', () => {
  let service: StudentService;
  let httpMock: HttpTestingController;

  // Mock AuthService
  const authServiceMock = {
    getToken: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StudentService,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(StudentService);
    httpMock = TestBed.inject(HttpTestingController);

    authServiceMock.getToken.mockReturnValue('my-token');
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('getAllStudents should call GET /api/student with Authorization header', () => {
    const mockStudents: Student[] = [
      {
        id: 1,
        firstName: 'Ana',
        lastName: 'Kim',
        email: 'ana@ex.com',
      } as Student,
      {
        id: 2,
        firstName: 'Tom',
        lastName: 'Lee',
        email: 'tom@ex.com',
      } as Student,
    ];

    service.getAllStudents().subscribe((students) => {
      expect(students).toEqual(mockStudents);
    });

    const req = httpMock.expectOne('/api/student');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');

    req.flush(mockStudents);
    expect(authServiceMock.getToken).toHaveBeenCalledTimes(1);
  });

  it('getStudentById should call GET /api/student/:id with Authorization header', () => {
    const mockStudent: Student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    } as Student;

    service.getStudentById(1).subscribe((student) => {
      expect(student).toEqual(mockStudent);
    });

    const req = httpMock.expectOne('/api/student/1');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');

    req.flush(mockStudent);
    expect(authServiceMock.getToken).toHaveBeenCalledTimes(1);
  });

  it('createStudent should call POST /api/student with body + Authorization header', () => {
    const payload: StudentRegister = {
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };

    service.createStudent(payload).subscribe((res) => {
      expect(res).toEqual({}); // ton service retourne Observable<Object>
    });

    const req = httpMock.expectOne('/api/student');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    expect(req.request.body).toEqual(payload);

    req.flush({});
    expect(authServiceMock.getToken).toHaveBeenCalledTimes(1);
  });

  it('deleteStudent should call DELETE /api/student/:id with Authorization header', () => {
    service.deleteStudent(1).subscribe((res) => {
      expect(res).toEqual({});
    });

    const req = httpMock.expectOne('/api/student/1');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');

    req.flush({});
    expect(authServiceMock.getToken).toHaveBeenCalledTimes(1);
  });

  it('updateStudent should call PUT /api/student/:id with body + Authorization header', () => {
    const payload: StudentRegister = {
      firstName: 'New',
      lastName: 'Name',
      email: 'new@ex.com',
    };

    const mockUpdated: Student = {
      id: 1,
      firstName: 'New',
      lastName: 'Name',
      email: 'new@ex.com',
    } as Student;

    service.updateStudent(1, payload).subscribe((student) => {
      expect(student).toEqual(mockUpdated);
    });

    const req = httpMock.expectOne('/api/student/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    expect(req.request.body).toEqual(payload);

    req.flush(mockUpdated);
    expect(authServiceMock.getToken).toHaveBeenCalledTimes(1);
  });

  it('should still send Authorization header even if token is null (current behavior)', () => {
    authServiceMock.getToken.mockReturnValueOnce(null);

    service.getAllStudents().subscribe();

    const req = httpMock.expectOne('/api/student');
    expect(req.request.headers.get('Authorization')).toBe('Bearer null');

    req.flush([]);
  });
});
