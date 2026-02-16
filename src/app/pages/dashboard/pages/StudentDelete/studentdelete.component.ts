import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../core/service/student.service';
import { E } from '@angular/cdk/keycodes';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../../../../core/models/Student';

@Component({
  selector: 'app-studentdelete',
  templateUrl: './studentdelete.component.html',
  imports: [CommonModule, MaterialModule],
})
export class StudentDeleteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentId: number | null = null;
  private studendService = inject(StudentService);
  private destroyRef = inject(DestroyRef);

  public student: Student | null = null;
  public errorMessage: string | null = null;
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.studentId = params['id'];
    });

    if (!this.studentId) {
      return;
    }

    this.studendService
      .getStudentById(this.studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.student = student;
        },
        error: (error) => {
          if (error.status === 401) {
            alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
            return;
          }
          this.errorMessage = 'Aucun étudiant correspondant trouvé.';
        },
      });
  }

  deleteStudent(id: number): void {
    if (!this.studentId) {
      return;
    }

    this.studendService
      .deleteStudent(this.studentId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          alert('Étudiant supprimé avec succès.');
          this.router.navigate(['/dashboard/student-list']);
        },
        error: (error) => {
          if (error.status === 401) {
            alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
            return;
          }
          this.errorMessage = "Erreur lors de la suppression de l'étudiant.";
        },
      });
  }

  onCancel(): void {
    if (this.studentId) {
      this.router.navigate(['/dashboard/student-list']);
    }
  }
}
