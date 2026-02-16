import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, of, throwError } from 'rxjs';

import { StudentDetailComponent } from './studentdetail.component';
import { StudentService } from '../../../../core/service/student.service';

describe('StudentDetailComponent', () => {
  let fixture: ComponentFixture<StudentDetailComponent>;
  let component: StudentDetailComponent;

  const studentServiceMock = {
    getStudentById: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  // IMPORTANT: ReplaySubject(1) permet d’émettre avant la création
  let params$: ReplaySubject<any>;
  let activatedRouteMock: { params: any };

  beforeEach(async () => {
    params$ = new ReplaySubject<any>(1);
    activatedRouteMock = { params: params$.asObservable() };

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent], // standalone
      providers: [
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function createComponentWithRouteId(id: number) {
    // ✅ on émet AVANT detectChanges()
    params$.next({ id });

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit()
  }

  it('should load student by id and store it', () => {
    // GIVEN
    const student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };

    studentServiceMock.getStudentById.mockReturnValue(of(student));

    // WHEN
    createComponentWithRouteId(1);

    // THEN
    expect(studentServiceMock.getStudentById).toHaveBeenCalledTimes(1);
    expect(studentServiceMock.getStudentById).toHaveBeenCalledWith(1);
    expect(component.student).toEqual(student);
    expect(component.errorMessage).toBeNull();
  });

  it('should handle 401 by alerting and redirecting to /login', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(
      throwError(() => ({ status: 401 })),
    );

    // WHEN
    createComponentWithRouteId(1);

    // THEN
    expect(window.alert).toHaveBeenCalledWith(
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.student).toBeNull();
    expect(component.errorMessage).toBeNull();
  });

  it('should handle non-401 errors by setting errorMessage', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );

    // WHEN
    createComponentWithRouteId(999);

    // THEN
    expect(component.student).toBeNull();
    expect(component.errorMessage).toBe('Aucun étudiant correspondant trouvé.');
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('goBack should navigate to /dashboard/student-list', () => {
    createComponentWithRouteId(1);

    component.goBack();

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student-list',
    ]);
  });

  it('goUpdateView should navigate to update route when studentId exists', () => {
    studentServiceMock.getStudentById.mockReturnValue(of({ id: 1 }));

    createComponentWithRouteId(1);

    component.goUpdateView();

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student/1/update',
    ]);
  });

  it('goUpdateView should not navigate if studentId is null', () => {
    // pas de params next -> studentId restera null
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.goUpdateView();

    expect(routerMock.navigate).not.toHaveBeenCalledWith(
      expect.arrayContaining(['/dashboard/student/']),
    );
  });
});
