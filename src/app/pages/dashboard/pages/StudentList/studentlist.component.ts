import { Component, DestroyRef, inject } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../../../core/service/student.service';
import { catchError, of, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-studentlist',
  imports: [CommonModule, MaterialModule],
  templateUrl: './studentlist.component.html',
  standalone: true,
})
export class StudentlistComponent {
  private studentService = inject(StudentService);
  private router = inject(Router);
  public errorMessage: string | null = null;

  students$ = this.studentService.getAllStudents().pipe(
    catchError((err) => {
      if (err.status === 401) {
        alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
        this.router.navigate(['/login']);
        return of([]);
      }
      this.errorMessage = 'Erreur chargement';
      return of([]);
    }),
    shareReplay(1),
  );

  viewStudent(studentId: number): void {
    this.router.navigate(['/dashboard/student', studentId, 'detail']);
  }

  viewDeleteStudent(studentId: number): void {
    this.router.navigate(['/dashboard/student', studentId, 'delete']);
  }
}
