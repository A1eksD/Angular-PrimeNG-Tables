import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Menubar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-chart-pie', routerLink: '/dashboard' },
    { label: 'Payments', icon: 'pi pi-credit-card', routerLink: '/payment' },
    { label: 'Chargebacks', icon: 'pi pi-exclamation-triangle', routerLink: '/chargebacks' },
    { label: 'Returns', icon: 'pi pi-arrow-circle-left', routerLink: '/returns' },
  ];
}
