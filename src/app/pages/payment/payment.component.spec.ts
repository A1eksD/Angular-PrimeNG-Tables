import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentComponent } from './payment.component';
import { mockApiInterceptor, MOCK_API_DELAY } from '../../interceptors/mock-api.interceptor';

describe('PaymentComponent', () => {
  let component: PaymentComponent;
  let fixture: ComponentFixture<PaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        { provide: MOCK_API_DELAY, useValue: 0 },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentComponent);
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

    it('should have 50 payment records from the API', () => {
      expect(component.tableConfig.data).toHaveLength(50);
    });

    it('should have 7 columns matching payment fields', () => {
      expect(component.tableConfig.columns).toHaveLength(7);
      const fields = component.tableConfig.columns.map((c) => c.field);
      expect(fields).toEqual(['id', 'date', 'customer', 'amount', 'method', 'status', 'reference']);
    });

    it('should set all columns as filterable', () => {
      for (const col of component.tableConfig.columns) {
        expect(col.filterable).toBe(true);
      }
    });

    it('should set all columns as searchable', () => {
      for (const col of component.tableConfig.columns) {
        expect(col.searchable).toBe(true);
      }
    });

    it('should enable export', () => {
      expect(component.tableConfig.exportEnabled).toBe(true);
      expect(component.tableConfig.exportFilename).toBe('payments-export');
    });

    it('should enable selection', () => {
      expect(component.tableConfig.selectionEnabled).toBe(true);
    });

    it('should configure edit and delete actions', () => {
      expect(component.tableConfig.actions).toHaveLength(2);
      expect(component.tableConfig.actions![0].icon).toBe('pi pi-pencil');
      expect(component.tableConfig.actions![0].tooltip).toBe('Edit payment');
      expect(component.tableConfig.actions![1].icon).toBe('pi pi-trash');
      expect(component.tableConfig.actions![1].tooltip).toBe('Delete payment');
    });

    it('should populate editColumns', () => {
      expect(component.editColumns).toHaveLength(7);
    });
  });

  describe('edit action', () => {
    it('should open edit dialog when edit callback is called', () => {
      expect(component.editDialogVisible).toBe(false);

      const testRow = component.tableConfig.data[0];
      component.tableConfig.actions![0].callback(testRow);

      expect(component.editDialogVisible).toBe(true);
    });

    it('should clone the row data (not reference original)', () => {
      const testRow = component.tableConfig.data[0];
      component.tableConfig.actions![0].callback(testRow);

      expect(component.editRow).not.toBe(testRow);
      expect(component.editRow['id']).toBe(testRow['id']);
    });

    it('should close dialog on saveEdit', () => {
      component.editDialogVisible = true;
      component.saveEdit();
      expect(component.editDialogVisible).toBe(false);
    });
  });

  describe('delete action (immutable)', () => {
    it('should not mutate original data array', () => {
      const originalLength = component.tableConfig.data.length;
      const testRow = component.tableConfig.data[0];

      component.tableConfig.actions![1].callback(testRow);

      expect(component.tableConfig.data).toHaveLength(originalLength);
    });
  });

  describe('column header formatting', () => {
    it('should format column headers from field names', () => {
      const headers = component.tableConfig.columns.map((c) => c.header);
      expect(headers).toContain('Id');
      expect(headers).toContain('Date');
      expect(headers).toContain('Customer');
      expect(headers).toContain('Amount');
      expect(headers).toContain('Method');
      expect(headers).toContain('Status');
      expect(headers).toContain('Reference');
    });
  });

  describe('template rendering', () => {
    it('should render the page title', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      expect(h2.textContent).toContain('Payments');
    });

    it('should render the dynamic table component after data loads', async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('app-dynamic-table');
      expect(table).toBeTruthy();
    });

    it('should render the edit dialog element', () => {
      const dialog = fixture.nativeElement.querySelector('p-dialog');
      expect(dialog).toBeTruthy();
    });
  });
});
