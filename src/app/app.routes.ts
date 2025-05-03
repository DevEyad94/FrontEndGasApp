import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './components/admin/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    title: 'APP.TITLE',
  },
  // {
  //   path: 'search/:id',
  //   component: GraveSearchDetailsComponent,
  //   title: 'SEARCH.TITLE',
  // },
  // {
  //   path: 'story',
  //   component: StoryComponent,
  //   title: 'MENU.STORY',
  // },
  {
    path: 'colors',
    loadComponent: () =>
      import('./components/color-scheme/color-scheme.component').then(
        (m) => m.ColorSchemeComponent
      ),
    title: 'Brand Colors',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/admin/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'MENU.LOGIN',
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./components/admin/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'MENU.LOGIN',
  },
  // {
  //   path: 'grave/management',
  //   loadComponent: () =>
  //     import(
  //       './components/admin/core/grave-management/grave-management.component'
  //     ).then((m) => m.GraveManagementComponent),
  //   canActivate: [AuthGuard, AdminGuard],
  //   data: { roles: ['Admin', 'User'] },
  //   title: 'MENU.MANAGEMENT',
  // },
  // {
  //   path: 'grave/management/new',
  //   loadComponent: () =>
  //     import('./components/admin/core/grave-form/grave-form.component').then(
  //       (m) => m.GraveFormComponent
  //     ),
  //   canActivate: [AuthGuard, AdminGuard],
  //   data: { roles: ['Admin', 'User'] },
  //   title: 'GRAVE.CREATE',
  // },
  // {
  //   path: 'grave/edit/:id',
  //   loadComponent: () =>
  //     import('./components/admin/core/grave-form/grave-form.component').then(
  //       (m) => m.GraveFormComponent
  //     ),
  //   canActivate: [AuthGuard, AdminGuard],
  //   data: { roles: ['Admin', 'User'] },
  //   title: 'GRAVE.EDIT',
  // },
  // {
  //   path: 'grave/:id',
  //   component: GraveSearchDetailsComponent,
  //   title: 'GRAVE.VIEW_DETAILS',
  // },
  // Add an unauthorized route
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
    title: 'APP.UNAUTHORIZED',
  },
  // Additional routes will be added as components are created
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirect any unknown routes to home
];
