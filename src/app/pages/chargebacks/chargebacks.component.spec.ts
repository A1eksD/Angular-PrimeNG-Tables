import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChargebacksComponent } from './chargebacks.component';
import { mockApiInterceptor, MOCK_API_DELAY } from '../../interceptors/mock-api.interceptor';

describe('ChargebacksComponent', () => {
  let component: ChargebacksComponent;
  let fixture: ComponentFixture<ChargebacksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChargebacksComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        { provide: MOCK_API_DELAY, useValue: 0 },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChargebacksComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization (via API)', () => {
    it('should initialize tableConfig after API response', () => {
      expect(component.tableConfig).toBeDefined();
    });

    it('should have 35 chargeback records from the API', () => {
      expect(component.tableConfig.data).toHaveLength(35);
    });

    it('should have 7 columns matching chargeback fields', () => {
      expect(component.tableConfig.columns).toHaveLength(7);
      const fields = component.tableConfig.columns.map((c) => c.field);
      expect(fields).toEqual([
        'id', 'date', 'originalPayment', 'customer', 'amount', 'reason', 'outcome',
      ]);
    });

    it('should disable export', () => {
      expect(component.tableConfig.exportEnabled).toBe(false);
    });

    it('should not have actions configured', () => {
      expect(component.tableConfig.actions).toBeUndefined();
    });

    it('should not have selection enabled', () => {
      expect(component.tableConfig.selectionEnabled).toBeUndefined();
    });
  });

  describe('column header formatting', () => {
    it('should format camelCase fields with spaces', () => {
      const originalPaymentCol = component.tableConfig.columns.find(
        (c) => c.field === 'originalPayment'
      );
      expect(originalPaymentCol?.header).toBe('Original Payment');
    });

    it('should capitalize single-word fields', () => {
      const dateCol = component.tableConfig.columns.find((c) => c.field === 'date');
      expect(dateCol?.header).toBe('Date');
    });
  });

  describe('template rendering', () => {
    it('should render the page title', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(h2.textContent).toContain('Chargebacks');
    });

    it('should render the dynamic table component after data loads', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('app-dynamic-table');
      expect(table).toBeTruthy();
    });
  });
});
