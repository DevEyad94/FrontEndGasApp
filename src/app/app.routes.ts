import { Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './components/admin/login/login.component';
import { Roles } from './core/enum/roles.enum';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/admin/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Login',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
    title: 'Dashboard',
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./components/map/map.component').then((m) => m.MapComponent),
    canActivate: [AuthGuard],
    title: 'Gas Field Map',
  },
  {
    path: 'production',
    loadComponent: () =>
      import(
        './components/production-records/production-records.component'
      ).then((m) => m.ProductionRecordsComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { roles: [Roles.ADMIN, Roles.OPERATOR] },
    title: 'Production Records',
  },
  {
    path: 'maintenance',
    loadComponent: () =>
      import(
        './components/maintenance-records/maintenance-records.component'
      ).then((m) => m.MaintenanceRecordsComponent),
    canActivate: [AuthGuard, AdminGuard],
    data: { roles: [Roles.ADMIN, Roles.ENGINEER] },
    title: 'Maintenance Records',
  },
  {
    path: 'colors',
    loadComponent: () =>
      import('./components/color-scheme/color-scheme.component').then(
        (m) => m.ColorSchemeComponent
      ),
    title: 'Brand Colors',
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
    title: 'Unauthorized',
  },
  // Additional routes will be added as components are created
  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }, // Redirect any unknown routes to dashboard
];
