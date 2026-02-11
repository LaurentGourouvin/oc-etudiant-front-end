import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../../core/service/student.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Student } from '../../../../core/models/Student';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentRegister } from '../../../../core/models/StudentRegister';

@Component({
  selector: 'app-studentupdate',
  templateUrl: './studentupdate.component.html',
  imports: [CommonModule, MaterialModule],
})
export class StudentUpdateComponent implements OnInit {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private studentService = inject(StudentService);
  private destroyRef = inject(DestroyRef);
  private studentId: number | null = null;
  public errorMessage: string | null = null;
  public student: Student | null = null;
  private formBuilder = inject(FormBuilder);
  public updateForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.updateForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

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

            this.updateForm.patchValue({
              firstName: student.firstName,
              lastName: student.lastName,
              email: student.email,
            });
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

  onSubmit(): void {
    if (this.studentId !== null && this.updateForm.valid) {
      const updatedStudent: StudentRegister = {
        firstName: this.updateForm.get('firstName')?.value,
        lastName: this.updateForm.get('lastName')?.value,
        email: this.updateForm.get('email')?.value,
      };

      this.studentService
        .updateStudent(this.studentId!, updatedStudent)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            alert('Étudiant mis à jour avec succès.');
            this.router.navigate([
              '/dashboard/student',
              this.studentId,
              'detail',
            ]);
          },
          error: (error) => {
            if (error.status === 401) {
              alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
              this.router.navigate(['/login']);
              return;
            }
            this.errorMessage = "Erreur lors de la mise à jour de l'étudiant.";
          },
        });
    }
  }

  onReset(): void {
    if (this.student) {
      this.updateForm.patchValue({
        firstName: this.student.firstName,
        lastName: this.student.lastName,
        email: this.student.email,
      });
    }

    this.router.navigate(['/dashboard/student', this.studentId, 'detail']);
  }
}
