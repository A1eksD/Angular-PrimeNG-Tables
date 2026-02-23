import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService);

  collapsed = this.sidebarService.collapsed;
  hoverExpanded = signal(false);
  paymentsOpen = signal(false);

  isExpanded = computed(() => !this.collapsed() || this.hoverExpanded());

  toggle() {
    this.sidebarService.toggle();
    this.hoverExpanded.set(false);
  }

  togglePayments() {
    this.paymentsOpen.update(v => !v);
  }

  onMouseEnter() {
    if (this.collapsed()) {
      this.hoverExpanded.set(true);
    }
  }

  onMouseLeave() {
    this.hoverExpanded.set(false);
  }
}
