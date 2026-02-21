import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateDashboardData', () => {
    it('should generate the default 30 items', () => {
      const data = service.generateDashboardData();
      expect(data).toHaveLength(30);
    });

    it('should generate a custom number of items', () => {
      const data = service.generateDashboardData(5);
      expect(data).toHaveLength(5);
    });

    it('should return items with label and value properties', () => {
      const data = service.generateDashboardData(3);
      for (const item of data) {
        expect(item).toHaveProperty('label');
        expect(item).toHaveProperty('value');
        expect(typeof item.label).toBe('string');
        expect(typeof item.value).toBe('number');
      }
    });

    it('should generate values between 100 and 1099', () => {
      const data = service.generateDashboardData(30);
      for (const item of data) {
        expect(item.value).toBeGreaterThanOrEqual(100);
        expect(item.value).toBeLessThan(1100);
      }
    });

    it('should use known category labels', () => {
      const data = service.generateDashboardData(3);
      const knownCategories = [
        'Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports',
        'Health', 'Beauty', 'Home', 'Garden', 'Auto', 'Music',
        'Movies', 'Games', 'Travel', 'Pets', 'Office', 'Tools',
        'Jewelry', 'Art', 'Software', 'Hardware', 'Education', 'Finance',
        'Insurance', 'Legal', 'Marketing', 'Consulting', 'Logistics', 'Energy',
      ];
      for (const item of data) {
        expect(knownCategories).toContain(item.label);
      }
    });
  });

  describe('generatePayments', () => {
    it('should generate the default 50 payments', () => {
      const data = service.generatePayments();
      expect(data).toHaveLength(50);
    });

    it('should generate a custom number of payments', () => {
      const data = service.generatePayments(10);
      expect(data).toHaveLength(10);
    });

    it('should have the expected payment fields', () => {
      const data = service.generatePayments(1);
      const payment = data[0];
      expect(payment).toHaveProperty('id');
      expect(payment).toHaveProperty('date');
      expect(payment).toHaveProperty('customer');
      expect(payment).toHaveProperty('amount');
      expect(payment).toHaveProperty('method');
      expect(payment).toHaveProperty('status');
      expect(payment).toHaveProperty('reference');
    });

    it('should generate sequential IDs starting at 1000', () => {
      const data = service.generatePayments(5);
      expect(data[0]['id']).toBe(1000);
      expect(data[1]['id']).toBe(1001);
      expect(data[4]['id']).toBe(1004);
    });

    it('should generate valid date strings (YYYY-MM-DD)', () => {
      const data = service.generatePayments(5);
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      for (const payment of data) {
        expect(payment['date']).toMatch(dateRegex);
      }
    });

    it('should generate amounts greater than 10', () => {
      const data = service.generatePayments(20);
      for (const payment of data) {
        expect(payment['amount'] as number).toBeGreaterThanOrEqual(10);
      }
    });

    it('should use valid statuses', () => {
      const validStatuses = ['Completed', 'Pending', 'Failed', 'Refunded'];
      const data = service.generatePayments(20);
      for (const payment of data) {
        expect(validStatuses).toContain(payment['status']);
      }
    });

    it('should use valid payment methods', () => {
      const validMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Crypto'];
      const data = service.generatePayments(20);
      for (const payment of data) {
        expect(validMethods).toContain(payment['method']);
      }
    });

    it('should generate references starting with PAY-', () => {
      const data = service.generatePayments(5);
      for (const payment of data) {
        expect((payment['reference'] as string).startsWith('PAY-')).toBe(true);
      }
    });
  });

  describe('generateChargebacks', () => {
    it('should generate the default 35 chargebacks', () => {
      const data = service.generateChargebacks();
      expect(data).toHaveLength(35);
    });

    it('should generate a custom number of chargebacks', () => {
      const data = service.generateChargebacks(10);
      expect(data).toHaveLength(10);
    });

    it('should have the expected chargeback fields', () => {
      const data = service.generateChargebacks(1);
      const chargeback = data[0];
      expect(chargeback).toHaveProperty('id');
      expect(chargeback).toHaveProperty('date');
      expect(chargeback).toHaveProperty('originalPayment');
      expect(chargeback).toHaveProperty('customer');
      expect(chargeback).toHaveProperty('amount');
      expect(chargeback).toHaveProperty('reason');
      expect(chargeback).toHaveProperty('outcome');
    });

    it('should generate sequential IDs starting at 5000', () => {
      const data = service.generateChargebacks(3);
      expect(data[0]['id']).toBe(5000);
      expect(data[1]['id']).toBe(5001);
      expect(data[2]['id']).toBe(5002);
    });

    it('should use valid reasons', () => {
      const validReasons = [
        'Unauthorized', 'Product not received', 'Duplicate charge',
        'Not as described', 'Subscription cancellation',
      ];
      const data = service.generateChargebacks(20);
      for (const cb of data) {
        expect(validReasons).toContain(cb['reason']);
      }
    });

    it('should use valid outcomes', () => {
      const validOutcomes = ['Won', 'Lost', 'Pending', 'Under Review'];
      const data = service.generateChargebacks(20);
      for (const cb of data) {
        expect(validOutcomes).toContain(cb['outcome']);
      }
    });
  });
});
