export interface TableColumn {
  field: string;
  header: string;
  filterable?: boolean;
  searchable?: boolean;
}

export interface TableAction {
  icon: string;
  tooltip: string;
  severity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  callback: (row: Record<string, unknown>) => void;
}

export type ExportFormat = 'excel' | 'csv';
export type ExportScope = 'all' | 'selection';

export interface TableConfig {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  actions?: TableAction[];
  exportEnabled?: boolean;
  exportFilename?: string;
  rows?: number;
  paginator?: boolean;
  globalFilter?: boolean;
  selectionEnabled?: boolean;
}
