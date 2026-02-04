import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../core/service/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Login } from '../../core/models/Login';
import { AuthService } from '../../core/service/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private AuthService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  public errorMessage: string | null = null;
  public loading: boolean = false;

  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const credentials: Login = {
      login: this.loginForm.get('login')?.value,
      password: this.loginForm.get('password')?.value,
    };

    this.userService
      .login(credentials)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        // NoError function
        next: (res) => {
          this.AuthService.setToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        // Handle Error
        error: (err) => {
          this.errorMessage = err.error.message;
        },
      });
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
    this.errorMessage = null;
  }
}
