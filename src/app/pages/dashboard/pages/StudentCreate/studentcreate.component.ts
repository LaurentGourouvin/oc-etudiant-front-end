import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../shared/material.module';
import { StudentService } from '../../../../core/service/student.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentRegister } from '../../../../core/models/StudentRegister';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-studentcreate',
  templateUrl: './studentcreate.component.html',
  imports: [CommonModule, MaterialModule],
})
export class StudentCreateComponent implements OnInit {
  private studentService = inject(StudentService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  errorMessage: string | null = null;
  studentForm: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.studentForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      return;
    }

    const newStudent: StudentRegister = {
      firstName: this.studentForm.get('firstName')?.value,
      lastName: this.studentForm.get('lastName')?.value,
      email: this.studentForm.get('email')?.value,
    };

    this.studentService
      .createStudent(newStudent)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (student) => {
          this.studentForm.reset();
          alert('Student created successfully!');
          this.router.navigate(['/dashboard/student-list']);
        },
        error: (error) => {
          if (error.status === 401) {
            alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
            this.router.navigate(['/login']);
            return;
          }

          this.errorMessage = "Erreur durant la création de l'étudiant.";
        },
      });
  }

  onReset(): void {
    this.studentForm.reset();
    this.errorMessage = null;
  }
}
