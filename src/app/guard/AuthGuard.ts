import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/service/auth.service';

export const AuthGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    alert('Vous avez été déconnecté. Veuillez vous reconnecter.');
    router.navigateByUrl('/login');
    return false;
  }
  return true;
};
