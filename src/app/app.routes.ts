import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { AppComponent } from './app.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guard/AuthGuard';
import { StudentlistComponent } from './pages/dashboard/pages/StudentList/studentlist.component';
import { StudentCreateComponent } from './pages/dashboard/pages/StudentCreate/studentcreate.component';
import { StudentDetailComponent } from './pages/dashboard/pages/StudentDetail/studentdetail.component';
import { StudentDeleteComponent } from './pages/dashboard/pages/StudentDelete/studentdelete.component';
import { StudentUpdateComponent } from './pages/dashboard/pages/StudentUpdate/studentupdate.component';

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
        canActivate: [AuthGuard],
      },
      {
        path: 'student-list',
        component: StudentlistComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'student-create',
        component: StudentCreateComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'student/:id/detail',
        component: StudentDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'student/:id/delete',
        component: StudentDeleteComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'student/:id/update',
        component: StudentUpdateComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];
