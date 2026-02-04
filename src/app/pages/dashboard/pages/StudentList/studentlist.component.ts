import { Component, DestroyRef, inject } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../core/service/student.service';
import { Student } from '../../../../core/models/Student';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-studentlist',
  imports: [CommonModule, MaterialModule],
  templateUrl: './studentlist.component.html',
  standalone: true,
})
export class StudentlistComponent {
  private studentService = inject(StudentService);
  public errorMessage: string | null = null;

  students$ = this.studentService.getAllStudents().pipe(
    catchError((err) => {
      this.errorMessage = 'Erreur chargement';
      return of([]);
    }),
  );
}
