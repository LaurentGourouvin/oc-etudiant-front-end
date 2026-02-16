import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { StudentCreateComponent } from './studentcreate.component';
import { StudentService } from '../../../../core/service/student.service';

describe('StudentCreateComponent', () => {
  let fixture: ComponentFixture<StudentCreateComponent>;
  let component: StudentCreateComponent;

  const studentServiceMock = {
    createStudent: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentCreateComponent], // standalone
      providers: [
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router, useValue: routerMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    jest.spyOn(window, 'alert').mockImplementation(() => {});
    fixture = TestBed.createComponent(StudentCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit()
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the form on init with validators', () => {
    expect(component.studentForm).toBeTruthy();

    expect(component.studentForm.get('firstName')).toBeTruthy();
    expect(component.studentForm.get('lastName')).toBeTruthy();
    expect(component.studentForm.get('email')).toBeTruthy();

    // Form vide => invalid
    expect(component.studentForm.valid).toBe(false);
  });

  it('onSubmit should mark all as touched and not call service when form is invalid', () => {
    // GIVEN: form invalide (vide)
    const markAllSpy = jest.spyOn(component.studentForm, 'markAllAsTouched');

    // WHEN
    component.onSubmit();

    // THEN
    expect(markAllSpy).toHaveBeenCalledTimes(1);
    expect(studentServiceMock.createStudent).not.toHaveBeenCalled();
  });

  it('onSubmit should call createStudent, reset form, alert and navigate on success', () => {
    // GIVEN
    studentServiceMock.createStudent.mockReturnValue(of({}));

    component.studentForm.patchValue({
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    });

    const resetSpy = jest.spyOn(component.studentForm, 'reset');

    // WHEN
    component.onSubmit();

    // THEN
    expect(studentServiceMock.createStudent).toHaveBeenCalledTimes(1);
    expect(studentServiceMock.createStudent).toHaveBeenCalledWith({
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    });

    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('Student created successfully!');
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student-list',
    ]);
    expect(component.errorMessage).toBeNull();
  });

  it('onSubmit should handle 401 by alerting and redirecting to /login', () => {
    // GIVEN
    studentServiceMock.createStudent.mockReturnValue(
      throwError(() => ({ status: 401 })),
    );

    component.studentForm.patchValue({
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(window.alert).toHaveBeenCalledWith(
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.errorMessage).toBeNull();
  });

  it('onSubmit should set errorMessage on non-401 error', () => {
    // GIVEN
    studentServiceMock.createStudent.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );

    component.studentForm.patchValue({
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(component.errorMessage).toBe(
      "Erreur durant la création de l'étudiant.",
    );
    expect(routerMock.navigate).not.toHaveBeenCalledWith(['/login']);
  });

  it('onReset should reset form and clear errorMessage', () => {
    // GIVEN
    component.errorMessage = 'boom';
    component.studentForm.patchValue({
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
    });

    const resetSpy = jest.spyOn(component.studentForm, 'reset');

    // WHEN
    component.onReset();

    // THEN
    expect(resetSpy).toHaveBeenCalledTimes(1);
    expect(component.errorMessage).toBeNull();
  });
});
