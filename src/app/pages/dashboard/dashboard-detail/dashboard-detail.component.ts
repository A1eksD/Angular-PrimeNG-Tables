import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard-detail',
  imports: [CardModule, ButtonModule, RouterLink, TitleCasePipe],
  templateUrl: './dashboard-detail.component.html',
})
export class DashboardDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  segmentName = '';

  ngOnInit(): void {
    this.segmentName = this.route.snapshot.paramMap.get('segment') ?? '';
  }
}
