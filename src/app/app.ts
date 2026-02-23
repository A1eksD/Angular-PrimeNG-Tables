import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarService } from './services/sidebar.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private sidebarService = inject(SidebarService);
  sidebarCollapsed = this.sidebarService.collapsed;
}
