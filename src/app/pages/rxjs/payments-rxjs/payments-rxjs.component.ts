import { Component, inject, OnInit, OnDestroy, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DynamicTableComponent } from '../../../components/dynamic-table/dynamic-table.component';
import { TableConfig, TableColumn } from '../../../models/table-config.model';
import { ApiService } from '../../../services/api.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

/** Placeholder columns shown while data is loading */
const PAYMENT_SKELETON_COLUMNS: TableColumn[] = [
  'Id', 'Date', 'Customer', 'Amount', 'Method', 'Status', 'Reference',
].map((h) => ({ field: h.toLowerCase(), header: h, filterable: true, searchable: true }));

@Component({
  selector: 'app-payments-rxjs',
  imports: [DynamicTableComponent, DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './payments-rxjs.component.html',
  styleUrl: './payments-rxjs.component.scss',
})
export class PaymentsRxjsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private dynamicTable = viewChild(DynamicTableComponent);

  // destroy$ ist wie ein "Notstopp-Knopf" – wenn wir next() aufrufen, hören ALLE Subscriptions auf
  private destroy$ = new Subject<void>();

  loading = signal(true);

  tableConfig: TableConfig = {
    columns: PAYMENT_SKELETON_COLUMNS,
    data: [],
    exportEnabled: true,
    exportFilename: 'payments-export',
    selectionEnabled: true,
    actions: [
      { icon: 'pi pi-pencil', tooltip: 'Edit payment', severity: 'info', callback: (row) => this.onEdit(row) },
      { icon: 'pi pi-trash', tooltip: 'Delete payment', severity: 'danger', callback: (row) => this.onDelete(row) },
    ],
  };

  // Edit modal state
  editDialogVisible = false;
  editRow: Record<string, unknown> = {};
  editColumns: TableColumn[] = [];

  ngOnInit(): void {
    this.api
      .get<Record<string, unknown>[]>('api/payments')
      .pipe(
        // takeUntil: "Hör zu, BIS destroy$ einen Wert bekommt – dann stopp!"
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        const columns: TableColumn[] = this.buildColumnsFromData(data);
        this.editColumns = columns;

        this.tableConfig = {
          columns,
          data,
          exportEnabled: true,
          exportFilename: 'payments-export',
          selectionEnabled: true,
          actions: [
            { icon: 'pi pi-pencil', tooltip: 'Edit payment', severity: 'info', callback: (row) => this.onEdit(row) },
            { icon: 'pi pi-trash', tooltip: 'Delete payment', severity: 'danger', callback: (row) => this.onDelete(row) },
          ],
        };
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    // Notstopp-Knopf drücken → alle takeUntil(this.destroy$) Subscriptions stoppen
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildColumnsFromData(data: Record<string, unknown>[]): TableColumn[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      field: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      filterable: true,
      searchable: true,
    }));
  }

  private onEdit(row: Record<string, unknown>): void {
    this.editRow = { ...row };
    this.editDialogVisible = true;
  }

  private onDelete(row: Record<string, unknown>): void {
    this.dynamicTable()?.deleteRow(row);
  }

  saveEdit(): void {
    // In a real app, call the API:
    // this.api.put(`api/payments/${this.editRow['id']}`, this.editRow).subscribe();
    console.log('Saved payment:', this.editRow);
    this.editDialogVisible = false;
  }
}
