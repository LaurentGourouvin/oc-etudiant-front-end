import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError, firstValueFrom } from 'rxjs';
import { delay } from 'rxjs/operators';

import { StudentlistComponent } from './studentlist.component';
import { StudentService } from '../../../../core/service/student.service';

describe('StudentlistComponent', () => {
  let fixture: ComponentFixture<StudentlistComponent>;
  let component: StudentlistComponent;

  const studentServiceMock = {
    getAllStudents: jest.fn(),
  };

  const routerMock = {
    navigate: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentlistComponent],
      providers: [
        { provide: StudentService, useValue: studentServiceMock },
        { provide: Router, useValue: routerMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StudentlistComponent, {
        set: { template: '' },
      })
      .compileComponents();

    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function createComponent() {
    fixture = TestBed.createComponent(StudentlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fixture.autoDetectChanges(false);
  }

  it('should load students list and emit it', async () => {
    // GIVEN
    const students = [
      { id: 1, firstName: 'Ana', lastName: 'Kim', email: 'ana@ex.com' },
      { id: 2, firstName: 'Tom', lastName: 'Lee', email: 'tom@ex.com' },
    ];
    studentServiceMock.getAllStudents.mockReturnValue(of(students));

    // WHEN
    createComponent();
    const result = await firstValueFrom(component.students$);

    // THEN
    expect(studentServiceMock.getAllStudents).toHaveBeenCalledTimes(1);
    expect(result).toEqual(students);
    expect(component.errorMessage).toBeNull();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should use shareReplay and call getAllStudents only once for multiple subscriptions', async () => {
    // GIVEN
    const students = [
      { id: 1, firstName: 'Ana', lastName: 'Kim', email: 'ana@ex.com' },
    ];
    studentServiceMock.getAllStudents.mockReturnValue(of(students));

    // WHEN
    createComponent();
    const r1 = await firstValueFrom(component.students$);
    const r2 = await firstValueFrom(component.students$);

    // THEN
    expect(studentServiceMock.getAllStudents).toHaveBeenCalledTimes(1);
    expect(r1).toEqual(students);
    expect(r2).toEqual(students);
  });

  it('should handle 401 by alerting, redirecting to /login, and returning []', fakeAsync(() => {
    // GIVEN (⚠️ erreur async pour éviter NG0100)
    studentServiceMock.getAllStudents.mockReturnValue(
      throwError(() => ({ status: 401 })).pipe(delay(0)),
    );

    // WHEN
    createComponent();
    tick(0); // laisse l’erreur se produire
    fixture.detectChanges();

    // THEN
    // Note: on relit la valeur émise après tick
    firstValueFrom(component.students$).then((result) => {
      expect(studentServiceMock.getAllStudents).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
      expect(window.alert).toHaveBeenCalledWith(
        'Vous avez été déconnecté. Veuillez vous reconnecter.',
      );
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.errorMessage).toBeNull();
    });
  }));

  it('should handle non-401 errors by setting errorMessage and returning []', async () => {
    // GIVEN
    studentServiceMock.getAllStudents.mockReturnValue(
      throwError(() => ({ status: 500 })),
    );

    // WHEN
    createComponent();

    const result = await firstValueFrom(component.students$);

    // THEN
    expect(result).toEqual([]);
    expect(component.errorMessage).toBe('Erreur chargement');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('viewStudent should navigate to student detail route', () => {
    // GIVEN
    studentServiceMock.getAllStudents.mockReturnValue(of([]));
    createComponent();

    // WHEN
    component.viewStudent(42);

    // THEN
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student',
      42,
      'detail',
    ]);
  });

  it('viewDeleteStudent should navigate to student delete route', () => {
    // GIVEN
    studentServiceMock.getAllStudents.mockReturnValue(of([]));
    createComponent();

    // WHEN
    component.viewDeleteStudent(42);

    // THEN
    expect(routerMock.navigate).toHaveBeenCalledWith([
      '/dashboard/student',
      42,
      'delete',
    ]);
  });
});
