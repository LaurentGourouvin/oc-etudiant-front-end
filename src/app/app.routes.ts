import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guard/AuthGuard';
import { StudentlistComponent } from './pages/dashboard/pages/StudentList/studentlist.component';
import { StudentCreateComponent } from './pages/dashboard/pages/StudentCreate/studentcreate.component';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: StudentCreateComponent,
      },
      {
        path: 'student-list',
        component: StudentlistComponent,
      },
      {
        path: 'student-create',
        component: StudentCreateComponent,
      },
    ],
  },
];
