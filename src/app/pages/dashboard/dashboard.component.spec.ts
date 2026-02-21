import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard.component';
import { mockApiInterceptor, MOCK_API_DELAY } from '../../interceptors/mock-api.interceptor';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        { provide: MOCK_API_DELAY, useValue: 0 },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('chart data initialization (via API)', () => {
    it('should initialize chartData after API response', () => {
      expect(component.chartData).toBeDefined();
    });

    it('should have labels in chartData', () => {
      expect(component.chartData.labels).toBeDefined();
      expect(component.chartData.labels).toHaveLength(30);
    });

    it('should have one dataset', () => {
      expect(component.chartData.datasets).toHaveLength(1);
    });

    it('should have 30 data points', () => {
      expect(component.chartData.datasets[0].data).toHaveLength(30);
    });

    it('should have 30 background colors', () => {
      expect(component.chartData.datasets[0].backgroundColor).toHaveLength(30);
    });

    it('should have 30 hover background colors', () => {
      expect(component.chartData.datasets[0].hoverBackgroundColor).toHaveLength(30);
    });

    it('should generate HSL colors for backgrounds', () => {
      const colors = component.chartData.datasets[0].backgroundColor;
      for (const color of colors) {
        expect(color).toMatch(/^hsl\(/);
      }
    });
  });

  describe('chart options', () => {
    it('should initialize chartOptions after API response', () => {
      expect(component.chartOptions).toBeDefined();
    });

    it('should be responsive', () => {
      expect(component.chartOptions.responsive).toBe(true);
    });

    it('should not maintain aspect ratio', () => {
      expect(component.chartOptions.maintainAspectRatio).toBe(false);
    });

    it('should position legend on the right', () => {
      expect(component.chartOptions.plugins.legend.position).toBe('right');
    });

    it('should have an onClick handler', () => {
      expect(typeof component.chartOptions.onClick).toBe('function');
    });
  });

  describe('template rendering', () => {
    it('should render the page title', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(h2.textContent).toContain('Dashboard');
    });

    it('should render a p-card element', () => {
      const card = fixture.nativeElement.querySelector('p-card');
      expect(card).toBeTruthy();
    });

    it('should render a p-chart element', () => {
      const chart = fixture.nativeElement.querySelector('p-chart');
      expect(chart).toBeTruthy();
    });

    it('should use doughnut chart type (not pie)', () => {
      const chart = fixture.nativeElement.querySelector('p-chart');
      expect(chart.getAttribute('type')).toBe('doughnut');
    });

    it('should render the chart hint text', () => {
      const hint = fixture.nativeElement.querySelector('.chart-hint');
      expect(hint).toBeTruthy();
      expect(hint.textContent).toContain('Click on a segment to view details');
    });
  });
});
