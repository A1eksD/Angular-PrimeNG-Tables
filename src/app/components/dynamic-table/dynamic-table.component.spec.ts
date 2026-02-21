import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicTableComponent } from './dynamic-table.component';
import { TableConfig } from '../../models/table-config.model';

// Host component to set the required input
@Component({
  selector: 'app-test-host',
  imports: [DynamicTableComponent],
  template: `<app-dynamic-table [config]="config" />`,
})
class TestHostComponent {
  config: TableConfig = {
    columns: [
      { field: 'id', header: 'ID' },
      { field: 'name', header: 'Name', searchable: true, filterable: true },
      { field: 'status', header: 'Status', searchable: true, filterable: true },
    ],
    data: [
      { id: 1, name: 'Alice', status: 'Active' },
      { id: 2, name: 'Bob', status: 'Inactive' },
      { id: 3, name: 'Charlie', status: 'Active' },
    ],
    exportEnabled: true,
    exportFilename: 'test-export',
    selectionEnabled: true,
    actions: [
      {
        icon: 'pi pi-pencil',
        tooltip: 'Edit',
        severity: 'info',
        callback: () => {},
      },
      {
        icon: 'pi pi-trash',
        tooltip: 'Delete',
        severity: 'danger',
        callback: () => {},
      },
    ],
  };
}

describe('DynamicTableComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let tableComponent: DynamicTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, NoopAnimationsModule],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();

    tableComponent = hostFixture.debugElement.children[0].componentInstance;
  });

  it('should create', () => {
    expect(tableComponent).toBeTruthy();
  });

  describe('computed properties', () => {
    it('should compute filterFields from columns', () => {
      expect(tableComponent.filterFields()).toEqual(['id', 'name', 'status']);
    });

    it('should detect searchable columns', () => {
      expect(tableComponent.hasSearchableColumns()).toBe(true);
    });

    it('should return false for hasSearchableColumns when none are searchable', () => {
      hostComponent.config = {
        columns: [
          { field: 'id', header: 'ID' },
          { field: 'name', header: 'Name' },
        ],
        data: [],
      };
      hostFixture.detectChanges();
      expect(tableComponent.hasSearchableColumns()).toBe(false);
    });

    it('should compute displayData as a clone of original data', () => {
      const display = tableComponent.displayData();
      expect(display).toHaveLength(3);
      expect(display).not.toBe(hostComponent.config.data);
      expect(display).toEqual(hostComponent.config.data);
    });
  });

  describe('deleteRow (immutable)', () => {
    it('should remove row from displayData without mutating original', () => {
      const originalData = hostComponent.config.data;
      const originalLength = originalData.length;

      tableComponent.deleteRow({ id: 2, name: 'Bob', status: 'Inactive' });

      expect(tableComponent.displayData()).toHaveLength(2);
      expect(tableComponent.displayData().find((r) => r['id'] === 2)).toBeUndefined();
      // Original data is untouched
      expect(originalData).toHaveLength(originalLength);
      expect(originalData.find((r) => r['id'] === 2)).toBeDefined();
    });

    it('should handle multiple deletes', () => {
      tableComponent.deleteRow({ id: 1 });
      tableComponent.deleteRow({ id: 3 });

      expect(tableComponent.displayData()).toHaveLength(1);
      expect(tableComponent.displayData()[0]['id']).toBe(2);
    });

    it('should remove deleted row from selectedRows', () => {
      tableComponent.selectedRows = [
        { id: 1, name: 'Alice', status: 'Active' },
        { id: 2, name: 'Bob', status: 'Inactive' },
      ];

      tableComponent.deleteRow({ id: 1 });

      expect(tableComponent.selectedRows).toHaveLength(1);
      expect(tableComponent.selectedRows[0]['id']).toBe(2);
    });
  });

  describe('column search', () => {
    it('should update columnSearchValues on applyColumnFilter', () => {
      tableComponent.applyColumnFilter('Alice', 'name');
      expect(tableComponent.columnSearchValues['name']).toBe('Alice');
    });

    it('should track independent search values per column', () => {
      tableComponent.applyColumnFilter('Alice', 'name');
      tableComponent.applyColumnFilter('Active', 'status');

      expect(tableComponent.columnSearchValues['name']).toBe('Alice');
      expect(tableComponent.columnSearchValues['status']).toBe('Active');
    });
  });

  describe('export dialog', () => {
    it('should open export dialog', () => {
      expect(tableComponent.exportDialogVisible).toBe(false);
      tableComponent.openExportDialog();
      expect(tableComponent.exportDialogVisible).toBe(true);
    });

    it('should have default export format as excel', () => {
      expect(tableComponent.exportFormat()).toBe('excel');
    });

    it('should have default export scope as all', () => {
      expect(tableComponent.exportScope()).toBe('all');
    });

    it('should have format options for Excel and CSV', () => {
      expect(tableComponent.formatOptions).toHaveLength(2);
      expect(tableComponent.formatOptions.map((o) => o.value)).toEqual(['excel', 'csv']);
    });

    it('should have scope options for all and selection', () => {
      expect(tableComponent.scopeOptions).toHaveLength(2);
      expect(tableComponent.scopeOptions.map((o) => o.value)).toEqual(['all', 'selection']);
    });

    it('should close dialog after executeExport', () => {
      tableComponent.exportDialogVisible = true;
      tableComponent.executeExport();
      expect(tableComponent.exportDialogVisible).toBe(false);
    });
  });

  describe('selection', () => {
    it('should initialize with empty selectedRows', () => {
      expect(tableComponent.selectedRows).toEqual([]);
    });
  });

  describe('template rendering', () => {
    it('should render column headers', () => {
      const headers = hostFixture.nativeElement.querySelectorAll('th');
      const headerTexts = Array.from(headers)
        .map((th: any) => th.textContent.trim())
        .filter((t: string) => t.length > 0);
      expect(headerTexts).toContain('ID');
      expect(headerTexts).toContain('Name');
      expect(headerTexts).toContain('Status');
    });

    it('should render data rows', () => {
      const rows = hostFixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThanOrEqual(3);
    });

    it('should render action buttons when actions are configured', () => {
      const headerTexts = Array.from(
        hostFixture.nativeElement.querySelectorAll('th')
      ).map((th: any) => th.textContent.trim());
      expect(headerTexts).toContain('Actions');
    });

    it('should render export button when exportEnabled', () => {
      const exportBar = hostFixture.nativeElement.querySelector('.export-bar');
      expect(exportBar).toBeTruthy();
    });

    it('should render search inputs for searchable columns', () => {
      const allInputs: HTMLInputElement[] = Array.from(
        hostFixture.nativeElement.querySelectorAll('input[placeholder]')
      );
      const columnSearchInputs = allInputs.filter(
        (el) => el.placeholder.startsWith('Search ') && el.placeholder !== 'Search...'
      );
      expect(columnSearchInputs.length).toBe(2); // name + status
    });

    it('should render selection checkboxes when selectionEnabled', () => {
      const checkboxes = hostFixture.nativeElement.querySelectorAll('p-tableCheckbox, p-tableHeaderCheckbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});
