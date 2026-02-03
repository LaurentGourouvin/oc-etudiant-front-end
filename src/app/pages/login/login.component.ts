import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/service/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Login } from '../../core/models/Login';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.logInfo();
  }

  logInfo(): void {
    console.log(this.loginForm.value);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.userService
      .login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // NoError function
        next: () => {
          this.router.navigate(['/']);
        },
        // Handle Error
        error: () => {
          alert('LOGIN FAILED!! :-(');
        },
      });
  }
}
