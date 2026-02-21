import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  generateDashboardData(count: number = 30): { label: string; value: number }[] {
    const categories = [
      'Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports',
      'Health', 'Beauty', 'Home', 'Garden', 'Auto', 'Music',
      'Movies', 'Games', 'Travel', 'Pets', 'Office', 'Tools',
      'Jewelry', 'Art', 'Software', 'Hardware', 'Education', 'Finance',
      'Insurance', 'Legal', 'Marketing', 'Consulting', 'Logistics', 'Energy',
    ];
    return categories.slice(0, count).map((label) => ({
      label,
      value: Math.floor(Math.random() * 1000) + 100,
    }));
  }

  generatePayments(count: number = 50): Record<string, unknown>[] {
    const statuses = ['Completed', 'Pending', 'Failed', 'Refunded'];
    const methods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Crypto'];
    return Array.from({ length: count }, (_, i) => ({
      id: 1000 + i,
      date: this.randomDate(),
      customer: `Customer ${i + 1}`,
      amount: +(Math.random() * 5000 + 10).toFixed(2),
      method: methods[Math.floor(Math.random() * methods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      reference: `PAY-${Date.now()}-${i}`,
    }));
  }

  generateChargebacks(count: number = 35): Record<string, unknown>[] {
    const reasons = [
      'Unauthorized', 'Product not received', 'Duplicate charge',
      'Not as described', 'Subscription cancellation',
    ];
    const outcomes = ['Won', 'Lost', 'Pending', 'Under Review'];
    return Array.from({ length: count }, (_, i) => ({
      id: 5000 + i,
      date: this.randomDate(),
      originalPayment: `PAY-${Date.now() - i * 100000}`,
      customer: `Customer ${Math.floor(Math.random() * 50) + 1}`,
      amount: +(Math.random() * 2000 + 5).toFixed(2),
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
    }));
  }

  generateReturns(): { data: Record<string, unknown>; children?: { data: Record<string, unknown> }[] }[] {
    const reasons = ['Defective', 'Wrong item', 'Changed mind', 'Not as described', 'Damaged in transit'];
    const statuses = ['Approved', 'Pending', 'Rejected', 'Processing'];
    const refundMethods = ['Original payment', 'Store credit', 'Bank transfer'];

    return Array.from({ length: 8 }, (_, i) => ({
      data: {
        id: `RET-${2000 + i}`,
        date: this.randomDate(),
        customer: `Customer ${i + 1}`,
        totalAmount: +(Math.random() * 1000 + 50).toFixed(2),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        items: Math.floor(Math.random() * 4) + 1,
      },
      children: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
        data: {
          id: `ITEM-${2000 + i}-${j}`,
          date: this.randomDate(),
          customer: '',
          totalAmount: +(Math.random() * 300 + 10).toFixed(2),
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          refundMethod: refundMethods[Math.floor(Math.random() * refundMethods.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          items: '',
        },
      })),
    }));
  }

  private randomDate(): string {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toISOString().split('T')[0];
  }
}
