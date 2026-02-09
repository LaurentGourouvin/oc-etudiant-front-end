import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../core/service/student.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../../../../core/models/Student';

@Component({
  selector: 'app-studentdetail',
  templateUrl: './studentdetail.component.html',
  imports: [CommonModule, MaterialModule],
})
export class StudentDetailComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private studentService = inject(StudentService);
  private destroyRef = inject(DestroyRef);

  private studentId: number | null = null;
  public student: Student | null = null;
  public errorMessage: string | null = null;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.studentId = params['id'];
    });

    if (this.studentId !== null) {
      this.studentService
        .getStudentById(this.studentId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (student) => {
            this.student = student;
          },
          error: (error) => {
            if (error.status === 401) {
              alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
              this.router.navigate(['/login']);
              return;
            }
            this.errorMessage = 'Aucun étudiant correspondant trouvé.';
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard/student-list']);
  }

  goUpdateView(): void {
    if (this.studentId !== null) {
      this.router.navigate([`/dashboard/student/${this.studentId}/update`]);
    }
  }
}
