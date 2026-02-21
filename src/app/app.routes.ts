import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'dashboard/:segment',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-detail/dashboard-detail.component').then(
        (m) => m.DashboardDetailComponent
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./pages/payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'chargebacks',
    loadComponent: () =>
      import('./pages/chargebacks/chargebacks.component').then((m) => m.ChargebacksComponent),
  },
  {
    path: 'returns',
    loadComponent: () =>
      import('./pages/returns/returns.component').then((m) => m.ReturnsComponent),
  },
];
