import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DynamicTableComponent } from '../../../components/dynamic-table/dynamic-table.component';
import { TableConfig, TableColumn } from '../../../models/table-config.model';
import { ApiService } from '../../../services/api.service';

/** Placeholder columns shown while data is loading */
const CHARGEBACK_SKELETON_COLUMNS: TableColumn[] = [
  'Id', 'Date', 'Original Payment', 'Customer', 'Amount', 'Reason', 'Outcome',
].map((h) => ({ field: h.toLowerCase().replace(/ /g, ''), header: h }));

@Component({
  selector: 'app-chargebacks-rxjs',
  imports: [DynamicTableComponent],
  templateUrl: './chargebacks-rxjs.component.html',
})
export class ChargebacksRxjsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  // destroy$ ist wie ein "Notstopp-Knopf" – wenn wir next() aufrufen, hören ALLE Subscriptions auf
  private destroy$ = new Subject<void>();

  loading = signal(true);

  tableConfig: TableConfig = {
    columns: CHARGEBACK_SKELETON_COLUMNS,
    data: [],
    exportEnabled: false,
  };

  ngOnInit(): void {
    this.api
      .get<Record<string, unknown>[]>('api/chargebacks')
      .pipe(
        // takeUntil: "Hör zu, BIS destroy$ einen Wert bekommt – dann stopp!"
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        const columns: TableColumn[] = this.buildColumnsFromData(data);

        this.tableConfig = {
          columns,
          data,
          exportEnabled: false,
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
    }));
  }
}
