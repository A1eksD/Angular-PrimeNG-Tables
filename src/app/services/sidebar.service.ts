import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly STORAGE_KEY = 'sidebar_collapsed';

  collapsed = signal(false);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.collapsed.set(stored === 'true');
  }

  toggle() {
    this.collapsed.update(v => !v);
    localStorage.setItem(this.STORAGE_KEY, String(this.collapsed()));
  }
}
