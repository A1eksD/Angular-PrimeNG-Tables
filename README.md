# AngularTableTest

Analytics Portal built with **Angular 21**, **PrimeNG 21** (Aura Theme) and **Chart.js**.

## Project Structure

```
src/app/
├── components/
│   └── dynamic-table/                # Reusable, config-driven table component
│       ├── dynamic-table.component.ts
│       ├── dynamic-table.component.html
│       ├── dynamic-table.component.scss
│       └── dynamic-table.component.spec.ts
├── interceptors/
│   ├── mock-api.interceptor.ts       # HttpInterceptorFn — intercepts dummy URLs, returns mock JSON
│   └── mock-api.interceptor.spec.ts
├── models/
│   └── table-config.model.ts         # TableConfig, TableColumn, TableAction, ExportFormat, ExportScope
├── pages/
│   ├── dashboard/
│   │   ├── dashboard.component.*     # Doughnut Chart with 30 random data points
│   │   ├── dashboard.component.spec.ts
│   │   └── dashboard-detail/         # Detail page (navigated via chart segment click)
│   ├── payment/
│   │   ├── payment.component.*       # DynamicTable with edit modal, delete, export dialog
│   │   └── payment.component.spec.ts
│   └── chargebacks/
│       ├── chargebacks.component.*   # DynamicTable without icons, without export
│       └── chargebacks.component.spec.ts
├── services/
│   ├── api.service.ts                # Generic HTTP service (HttpClient wrapper)
│   ├── mock-data.service.ts          # Generates dummy data for development
│   └── mock-data.service.spec.ts
├── app.config.ts                     # PrimeNG + Aura theme + HttpClient + mock interceptor
├── app.routes.ts                     # Lazy-loaded routes
└── app.*                             # App shell with PrimeNG Menubar
```

## Features

- **Dashboard** — Doughnut Chart (Chart.js via PrimeNG) with 30 random categories. Clicking a segment navigates to a detail page.
- **Payments** — DynamicTable with edit modal dialog, immutable row delete, row selection checkboxes, per-column search/filter, and dialog-based Excel/CSV export.
- **Chargebacks** — DynamicTable without any icons and without export.
- **DynamicTable** — Fully reusable component with zero business logic. Columns, rows, actions, selection, filtering, searching, and export are all injected via `TableConfig`. Supports:
  - Sorting and pagination
  - Global search filter
  - Per-column search inputs (configurable via `searchable` flag)
  - Per-column filter menus (configurable via `filterable` flag)
  - Row selection with checkboxes (configurable via `selectionEnabled`)
  - Immutable row deletion (original data never mutated)
  - Dialog-based export with Excel/CSV format and All/Selection scope
  - Configurable row actions with callbacks
- **Table Styling** — Custom table colors: header/footer `#4B4B4B`, selected row `#F0A032`, hover row `#F5CA8E`.
- **RxJS Data Flow** — All page components fetch data via `ApiService.get<T>()` with RxJS Observables. A functional `HttpInterceptorFn` intercepts dummy API URLs and returns mock JSON with simulated latency.

## Table Configuration

The table component is driven by the `TableConfig` interface:

```ts
interface TableColumn {
  field: string;        // Data property key
  header: string;       // Display header text
  filterable?: boolean; // Show column filter menu
  searchable?: boolean; // Show column search input
}

interface TableConfig {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  actions?: TableAction[];          // Row action buttons (edit, delete, etc.)
  exportEnabled?: boolean;          // Show export button + dialog
  exportFilename?: string;          // Filename for exported files
  selectionEnabled?: boolean;       // Show row checkboxes
  rows?: number;                    // Rows per page (default: 10)
  paginator?: boolean;              // Show paginator (default: true)
  globalFilter?: boolean;           // Show global search (default: true)
}
```

## Routes

| Path                  | Page             |
|-----------------------|------------------|
| `/dashboard`          | Dashboard        |
| `/dashboard/:segment` | Dashboard Detail |
| `/payment`            | Payments         |
| `/chargebacks`        | Chargebacks      |

## Data Architecture (Mock API Interceptor)

All data flows through Angular's `HttpClient` and RxJS Observables:

```
Component  →  ApiService.get<T>('api/payments')  →  HttpClient
                                                        ↓
                                                  mockApiInterceptor
                                                        ↓
                                              MockDataService.generate*()
                                                        ↓
                                                  HttpResponse (JSON)
```

**How it works:**

1. Page components call `ApiService.get<T>('api/payments')` which returns an `Observable<T>`.
2. The functional `HttpInterceptorFn` (`mock-api.interceptor.ts`) intercepts requests to dummy URLs (`/api/payments`, `/api/chargebacks`, `/api/dashboard`).
3. The interceptor returns mock JSON via `MockDataService` with a configurable simulated latency (`MOCK_API_DELAY` InjectionToken, default 200–400 ms).
4. Components subscribe and set their `tableConfig` / `chartData` once data arrives.

**Dummy API endpoints (intercepted):**

| URL                | Data                    | Records |
|--------------------|-------------------------|---------|
| `/api/payments`    | Payment transactions    | 50      |
| `/api/chargebacks` | Chargeback records      | 35      |
| `/api/dashboard`   | Dashboard chart data    | 30      |

### Switching to a Real Backend

1. Set `apiBaseUrl` in `src/environments/environment.ts`:
   ```ts
   export const environment = {
     production: false,
     apiBaseUrl: 'http://localhost:8080',
   };
   ```
2. Remove `mockApiInterceptor` from the `withInterceptors([])` array in `app.config.ts`.
3. No other code changes needed — all components already use `ApiService.get<T>()`.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

**95 tests** across 6 spec files:
- **MockDataService** — data generation, field validation, value ranges (21 tests)
- **DynamicTableComponent** — computed properties, immutable delete, column search, export dialog, template rendering (23 tests)
- **PaymentComponent** — API initialization, edit modal, immutable delete, column config, DOM rendering (18 tests)
- **DashboardComponent** — API initialization, chart data/options, doughnut type verification, template rendering (18 tests)
- **ChargebacksComponent** — API initialization, column formatting, config, DOM rendering (11 tests)
- **MockApiInterceptor** — intercepted responses for payments, chargebacks, dashboard, pass-through for unknown URLs (4 tests)

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
# Angular-PrimeNG-Tables
