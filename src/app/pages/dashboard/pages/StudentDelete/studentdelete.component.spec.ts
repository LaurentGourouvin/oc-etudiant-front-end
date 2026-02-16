import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDeleteComponent } from './studentdelete.component';
import { StudentService } from '../../../../core/service/student.service';

describe('StudentDeleteComponent', () => {
  let fixture: ComponentFixture<StudentDeleteComponent>;
  let component: StudentDeleteComponent;

  const studentServiceMock = {
    getStudentById: jest.fn(),
    deleteStudent: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  // on choisit l'id dans chaque test
  const activatedRouteMock = {
    params: of({ id: 1 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDeleteComponent],
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

  function createComponentWithRouteId(idValue: any) {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: { params: of({ id: idValue }) },
    });

    fixture = TestBed.createComponent(StudentDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit()
  }

  it('should load student on init when id is present', () => {
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

  it('should do nothing on init when id is missing (null/undefined)', () => {
    // WHEN
    createComponentWithRouteId(undefined);

    // THEN
    expect(studentServiceMock.getStudentById).not.toHaveBeenCalled();
    expect(component.student).toBeNull();
  });

  it('should handle 401 on init by alerting and not navigating', () => {
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
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeNull();
  });

  it('should set errorMessage on init when non-401 error occurs', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(
      throwError(() => ({ status: 404 })),
    );

    // WHEN
    createComponentWithRouteId(1);

    // THEN
    expect(component.errorMessage).toBe('Aucun étudiant correspondant trouvé.');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('deleteStudent should do nothing if studentId is missing', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(of({}));
    createComponentWithRouteId(undefined);

    // WHEN
    component.deleteStudent(999);

    // THEN
    expect(studentServiceMock.deleteStudent).not.toHaveBeenCalled();
  });

  it('deleteStudent should call service, alert and navigate on success', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(of({}));
    studentServiceMock.deleteStudent.mockReturnValue(of({}));

    createComponentWithRouteId(1);

    // WHEN
    component.deleteStudent(1);

    // THEN
    expect(studentServiceMock.deleteStudent).toHaveBeenCalledTimes(1);
    expect(studentServiceMock.deleteStudent).toHaveBeenCalledWith(1);

    expect(window.alert).toHaveBeenCalledWith('Étudiant supprimé avec succès.');
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student-list',
    ]);
    expect(component.errorMessage).toBeNull();
  });

  it('deleteStudent should handle 401 by alerting and not navigating', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(of({}));
    studentServiceMock.deleteStudent.mockReturnValue(
      throwError(() => ({ status: 401 })),
    );

    createComponentWithRouteId(1);

    // WHEN
    component.deleteStudent(1);

    // THEN
    expect(window.alert).toHaveBeenCalledWith(
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
    expect(routerMock.navigate).not.toHaveBeenCalledWith([
      '/dashboard/student-list',
    ]);
    expect(component.errorMessage).toBeNull();
  });

  it('deleteStudent should set errorMessage on non-401 error', () => {
    // GIVEN
    studentServiceMock.getStudentById.mockReturnValue(of({}));
    studentServiceMock.deleteStudent.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );

    createComponentWithRouteId(1);

    // WHEN
    component.deleteStudent(1);

    // THEN
    expect(component.errorMessage).toBe(
      "Erreur lors de la suppression de l'étudiant.",
    );
  });
});
