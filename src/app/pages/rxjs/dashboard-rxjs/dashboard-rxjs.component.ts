import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UIChart } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-dashboard-rxjs',
  imports: [UIChart, CardModule],
  templateUrl: './dashboard-rxjs.component.html',
  styleUrl: './dashboard-rxjs.component.scss',
})
export class DashboardRxjsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private api = inject(ApiService);

  // destroy$ ist wie ein "Notstopp-Knopf" – wenn wir next() aufrufen, hören ALLE Subscriptions auf
  private destroy$ = new Subject<void>();

  chartData: any;
  chartOptions: any;

  private segments: { label: string; value: number }[] = [];

  ngOnInit(): void {
    this.api
      .get<{ label: string; value: number }[]>('api/dashboard')
      .pipe(
        // takeUntil: "Hör zu, BIS destroy$ einen Wert bekommt – dann stopp!"
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.segments = data;
        this.buildChart();
      });
  }

  ngOnDestroy(): void {
    // Notstopp-Knopf drücken → alle takeUntil(this.destroy$) Subscriptions stoppen
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildChart(): void {
    const colors = this.segments.map((_, i) =>
      `hsl(${(i * 360) / this.segments.length}, 70%, 55%)`
    );

    this.chartData = {
      labels: this.segments.map((s) => s.label),
      datasets: [
        {
          data: this.segments.map((s) => s.value),
          backgroundColor: colors,
          hoverBackgroundColor: colors.map((c) => c.replace('55%', '45%')),
        },
      ],
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { usePointStyle: true, padding: 12 },
        },
      },
      onClick: (_event: any, elements: any[]) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const segment = this.segments[index];
          this.router.navigate(['/dashboard', segment.label.toLowerCase()]);
        }
      },
    };
  }
}
