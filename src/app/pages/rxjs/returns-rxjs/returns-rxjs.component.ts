import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-returns-rxjs',
  imports: [TreeTableModule, SkeletonModule, DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './returns-rxjs.component.html',
  styleUrl: './returns-rxjs.component.scss',
})
export class ReturnsRxjsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  // destroy$ ist wie ein "Notstopp-Knopf" – wenn wir next() aufrufen, hören ALLE Subscriptions auf
  private destroy$ = new Subject<void>();

  loading = signal(true);
  nodes: TreeNode[] = [];

  /** Dummy rows for the skeleton – 10 placeholder rows */
  skeletonRows = Array(10).fill(null);

  columns = [
    { field: 'id', header: 'ID' },
    { field: 'date', header: 'Date' },
    { field: 'customer', header: 'Customer' },
    { field: 'totalAmount', header: 'Amount' },
    { field: 'status', header: 'Status' },
    { field: 'reason', header: 'Reason' },
    { field: 'refundMethod', header: 'Refund Method' },
  ];

  // Edit-Dialog State
  editDialogVisible = false;
  editRow: Record<string, unknown> = {};

  ngOnInit(): void {
    this.api
      .get<{ data: Record<string, unknown>; children?: { data: Record<string, unknown> }[] }[]>(
        'api/returns'
      )
      .pipe(
        // takeUntil: "Hör zu, BIS destroy$ einen Wert bekommt – dann stopp!"
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        this.nodes = data as TreeNode[];
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    // Notstopp-Knopf drücken → alle takeUntil(this.destroy$) Subscriptions stoppen
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Edit (PUT) ───────────────────────────────────────────────────────────────
  onEdit(rowData: Record<string, unknown>): void {
    // Kopie der Zeile machen damit wir die Originaldaten nicht direkt verändern
    this.editRow = { ...rowData };
    this.editDialogVisible = true;
  }

  saveEdit(): void {
    const id = this.editRow['id'];
    // PUT mit takeUntil – in einer echten App würde das so aussehen:
    // this.api.put(`api/returns/${id}`, this.editRow)
    //   .pipe(takeUntil(this.destroy$))  // ← auch PUT/DELETE absichern!
    //   .subscribe(() => {
    //     this.nodes = this.nodes.map(node => {
    //       if (node.data['id'] === id) return { ...node, data: { ...this.editRow } };
    //       return node;
    //     });
    //   });
    console.log(`[PUT] api/returns/${id}`, this.editRow);
    // Lokal aktualisieren (ohne echten API-Call)
    this.nodes = this.nodes.map(node => {
      if (node.data['id'] === id) return { ...node, data: { ...this.editRow } };
      return node;
    });
    this.editDialogVisible = false;
  }

  // ── Delete (DELETE) ──────────────────────────────────────────────────────────
  onDelete(rowData: Record<string, unknown>): void {
    const id = rowData['id'];
    // DELETE mit takeUntil – in einer echten App würde das so aussehen:
    // this.api.delete(`api/returns/${id}`)
    //   .pipe(takeUntil(this.destroy$))  // ← auch hier absichern!
    //   .subscribe(() => {
    //     this.nodes = this.nodes.filter(node => node.data['id'] !== id);
    //   });
    console.log(`[DELETE] api/returns/${id}`);
    // Lokal löschen (ohne echten API-Call)
    this.nodes = this.nodes.filter(node => node.data['id'] !== id);
  }
}
