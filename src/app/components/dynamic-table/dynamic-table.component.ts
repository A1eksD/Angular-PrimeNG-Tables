import { Component, computed, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TableConfig, ExportFormat, ExportScope } from '../../models/table-config.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dynamic-table',
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    SelectButtonModule,
    SkeletonModule,
  ],
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss',
})
export class DynamicTableComponent {
  config = input.required<TableConfig>();
  loading = input<boolean>(false);

  /** Dummy rows shown as skeleton placeholders while loading */
  skeletonRows = Array(10).fill(null);

  filterFields = computed(() => this.config().columns.map((c) => c.field));

  hasSearchableColumns = computed(() => this.config().columns.some((c) => c.searchable));

  displayData = computed(() => {
    const original = this.config().data;
    const excluded = this.deletedIds();
    if (excluded.size === 0) return [...original];
    return original.filter((row) => !excluded.has(row['id']));
  });

  private table = viewChild<Table>('dt');

  selectedRows: Record<string, unknown>[] = [];
  columnSearchValues: Record<string, string> = {};

  // Deleted row tracking (immutable — original data untouched)
  private deletedIds = signal<Set<unknown>>(new Set());

  // Export dialog state
  exportDialogVisible = false;
  exportFormat = signal<ExportFormat>('excel');
  exportScope = signal<ExportScope>('all');

  formatOptions = [
    { label: 'Excel', value: 'excel', icon: 'pi pi-file-excel' },
    { label: 'CSV', value: 'csv', icon: 'pi pi-file' },
  ];

  scopeOptions = [
    { label: 'Export All', value: 'all' },
    { label: 'Only Selection', value: 'selection' },
  ];

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.table()?.filterGlobal(value, 'contains');
  }

  applyColumnFilter(value: string, field: string): void {
    this.columnSearchValues[field] = value;
    this.table()?.filter(value, field, 'contains');
  }

  deleteRow(row: Record<string, unknown>): void {
    this.deletedIds.update((ids) => {
      const next = new Set(ids);
      next.add(row['id']);
      return next;
    });
    // Remove from selection if selected
    this.selectedRows = this.selectedRows.filter((r) => r['id'] !== row['id']);
  }

  openExportDialog(): void {
    this.exportDialogVisible = true;
  }

  executeExport(): void {
    const cfg = this.config();
    const format = this.exportFormat();
    const scope = this.exportScope();

    const sourceData =
      scope === 'selection' && this.selectedRows.length > 0
        ? this.selectedRows
        : this.getFilteredData();

    const headers = cfg.columns.map((c) => c.header);
    const rows = sourceData.map((row) => cfg.columns.map((c) => row[c.field]));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const filename = cfg.exportFilename ?? 'export';

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${filename}.csv`);
    } else {
      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `${filename}.xlsx`);
    }

    this.exportDialogVisible = false;
  }

  private getFilteredData(): Record<string, unknown>[] {
    const tableRef = this.table();
    if (tableRef?.filteredValue) {
      return tableRef.filteredValue;
    }
    return this.displayData();
  }
}
