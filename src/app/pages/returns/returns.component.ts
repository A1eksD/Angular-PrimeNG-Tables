import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-returns',
  imports: [TreeTableModule, SkeletonModule, DialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.scss',
})
export class ReturnsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);

  // Das "Zeitungs-Abo" – wir speichern die Subscription damit wir sie später kündigen können
  private returnsSub: Subscription | null = null;

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
    // Wir speichern das Abo in "returnsSub"
    this.returnsSub = this.api
      .get<{ data: Record<string, unknown>; children?: { data: Record<string, unknown> }[] }[]>(
        'api/returns'
      )
      .subscribe((data) => {
        this.nodes = data as TreeNode[];
        this.loading.set(false);
      });
  }

  // Wird automatisch aufgerufen wenn die Komponente zerstört wird (z.B. beim Seitenwechsel)
  ngOnDestroy(): void {
    // Abo kündigen → kein Memory Leak!
    this.returnsSub?.unsubscribe();
  }

  // ── Edit (PUT) ───────────────────────────────────────────────────────────────
  onEdit(rowData: Record<string, unknown>): void {
    // Kopie der Zeile machen damit wir die Originaldaten nicht direkt verändern
    this.editRow = { ...rowData };
    this.editDialogVisible = true;
  }

  saveEdit(): void {
    const id = this.editRow['id'];
    // PUT – bestehenden Eintrag aktualisieren
    // In einer echten App würde das so aussehen:
    // this.returnsSub = this.api.put(`api/returns/${id}`, this.editRow).subscribe(() => {
    //   // Lokal in nodes aktualisieren damit kein erneuter GET nötig ist
    //   this.nodes = this.nodes.map(node => {
    //     if (node.data['id'] === id) return { ...node, data: { ...this.editRow } };
    //     return node;
    //   });
    // });
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
    // DELETE – Eintrag löschen
    // In einer echten App würde das so aussehen:
    // this.returnsSub = this.api.delete(`api/returns/${id}`).subscribe(() => {
    //   this.nodes = this.nodes.filter(node => node.data['id'] !== id);
    // });
    console.log(`[DELETE] api/returns/${id}`);
    // Lokal löschen (ohne echten API-Call)
    this.nodes = this.nodes.filter(node => node.data['id'] !== id);
  }
}
