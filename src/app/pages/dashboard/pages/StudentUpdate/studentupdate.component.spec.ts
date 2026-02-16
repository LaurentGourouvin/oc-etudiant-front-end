import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { StudentUpdateComponent } from './studentupdate.component';
import { StudentService } from '../../../../core/service/student.service';

describe('StudentUpdateComponent', () => {
  let fixture: ComponentFixture<StudentUpdateComponent>;
  let component: StudentUpdateComponent;

  const studentServiceMock = {
    getStudentById: jest.fn(),
    updateStudent: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  let params$: ReplaySubject<any>;
  let activatedRouteMock: { params: any };

  beforeEach(async () => {
    params$ = new ReplaySubject<any>(1);
    activatedRouteMock = { params: params$.asObservable() };

    await TestBed.configureTestingModule({
      imports: [StudentUpdateComponent],
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
    // IMPORTANT: émettre avant detectChanges()
    params$.next({ id });

    fixture = TestBed.createComponent(StudentUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // déclenche ngOnInit()
  }

  it('should load student by id and patch the form', () => {
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

    expect(component.updateForm.get('firstName')?.value).toBe('Ana');
    expect(component.updateForm.get('lastName')?.value).toBe('Kim');
    expect(component.updateForm.get('email')?.value).toBe('ana@ex.com');

    expect(component.errorMessage).toBeNull();
  });

  it('should handle 401 on init by alerting and redirecting to /login', () => {
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
    expect(component.errorMessage).toBeNull();
  });

  it('should handle non-401 errors on init by setting errorMessage', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );

    // WHEN
    createComponentWithRouteId(999);

    // THEN
    expect(component.errorMessage).toBe('Aucun étudiant correspondant trouvé.');
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/login']);
  });

  it('onSubmit should call updateStudent and redirect to detail on success', () => {
    // GIVEN
    const student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };
    studentServiceMock.getStudentById.mockReturnValue(of(student));

    studentServiceMock.updateStudent.mockReturnValue(of(student));

    createComponentWithRouteId(1);

    component.updateForm.patchValue({
      firstName: 'New',
      lastName: 'Name',
      email: 'new@ex.com',
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(studentServiceMock.updateStudent).toHaveBeenCalledTimes(1);
    expect(studentServiceMock.updateStudent).toHaveBeenCalledWith(1, {
      firstName: 'New',
      lastName: 'Name',
      email: 'new@ex.com',
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Étudiant mis à jour avec succès.',
    );
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student',
      1,
      'detail',
    ]);
    expect(component.errorMessage).toBeNull();
  });

  it('onSubmit should do nothing if form is invalid', () => {
    // GIVEN
    const student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };
    studentServiceMock.getStudentById.mockReturnValue(of(student));

    createComponentWithRouteId(1);

    // form invalide (ex: email vide)
    component.updateForm.patchValue({
      firstName: 'New',
      lastName: 'Name',
      email: '',
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(studentServiceMock.updateStudent).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalledWith([
      '/dashboard/student',
      1,
      'detail',
    ]);
  });

  it('onSubmit should handle 401 by alerting and redirecting to /login', () => {
    // GIVEN
    const student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };
    studentServiceMock.getStudentById.mockReturnValue(of(student));

    studentServiceMock.updateStudent.mockReturnValue(
      throwError(() => ({ status: 401 })),
    );

    createComponentWithRouteId(1);

    component.updateForm.patchValue({
      firstName: 'New',
      lastName: 'Name',
      email: 'new@ex.com',
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(window.alert).toHaveBeenCalledWith(
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('onSubmit should handle non-401 errors by setting errorMessage', () => {
    // GIVEN
    const student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };
    studentServiceMock.getStudentById.mockReturnValue(of(student));

    studentServiceMock.updateStudent.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );

    createComponentWithRouteId(1);

    component.updateForm.patchValue({
      firstName: 'New',
      lastName: 'Name',
      email: 'new@ex.com',
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(component.errorMessage).toBe(
      "Erreur lors de la mise à jour de l'étudiant.",
    );
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/login']);
  });

  it('onReset should restore form values from loaded student and navigate to detail', () => {
    // GIVEN
    const student = {
      id: 1,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    };
    studentServiceMock.getStudentById.mockReturnValue(of(student));

    createComponentWithRouteId(1);

    component.updateForm.patchValue({
      firstName: 'Dirty',
      lastName: 'Dirty',
      email: 'dirty@ex.com',
    });

    // WHEN
    component.onReset();

    // THEN
    expect(component.updateForm.get('firstName')?.value).toBe('Ana');
    expect(component.updateForm.get('lastName')?.value).toBe('Kim');
    expect(component.updateForm.get('email')?.value).toBe('ana@ex.com');

    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student',
      1,
      'detail',
    ]);
  });
});
