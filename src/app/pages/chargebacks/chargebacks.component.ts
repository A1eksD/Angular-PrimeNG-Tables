import { Component, inject, OnInit, signal } from '@angular/core';
import { DynamicTableComponent } from '../../components/dynamic-table/dynamic-table.component';
import { TableConfig, TableColumn } from '../../models/table-config.model';
import { ApiService } from '../../services/api.service';

/** Placeholder columns shown while data is loading */
const CHARGEBACK_SKELETON_COLUMNS: TableColumn[] = [
  'Id', 'Date', 'Original Payment', 'Customer', 'Amount', 'Reason', 'Outcome',
].map((h) => ({ field: h.toLowerCase().replace(/ /g, ''), header: h }));

@Component({
  selector: 'app-chargebacks',
  imports: [DynamicTableComponent],
  templateUrl: './chargebacks.component.html',
})
export class ChargebacksComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);

  tableConfig: TableConfig = {
    columns: CHARGEBACK_SKELETON_COLUMNS,
    data: [],
    exportEnabled: false,
  };

  ngOnInit(): void {
    this.api.get<Record<string, unknown>[]>('api/chargebacks').subscribe((data) => {
      const columns: TableColumn[] = this.buildColumnsFromData(data);

      this.tableConfig = {
        columns,
        data,
        exportEnabled: false,
      };
      this.loading.set(false);
    });
  }

  private buildColumnsFromData(data: Record<string, unknown>[]): TableColumn[] {
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({
      field: key,
      header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    }));
  }
}
