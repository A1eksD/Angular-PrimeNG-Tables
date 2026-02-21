import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { mockApiInterceptor, MOCK_API_DELAY } from './mock-api.interceptor';

describe('mockApiInterceptor', () => {
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mockApiInterceptor])),
        { provide: MOCK_API_DELAY, useValue: 0 },
      ],
    });
    http = TestBed.inject(HttpClient);
  });

  it('should intercept /api/payments and return 50 records', async () => {
    const result = await firstValueFrom(http.get<any[]>('/api/payments'));
    expect(result).toHaveLength(50);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('customer');
    expect(result[0]).toHaveProperty('amount');
  });

  it('should intercept /api/chargebacks and return 35 records', async () => {
    const result = await firstValueFrom(http.get<any[]>('/api/chargebacks'));
    expect(result).toHaveLength(35);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('reason');
    expect(result[0]).toHaveProperty('outcome');
  });

  it('should intercept /api/dashboard and return 30 segments', async () => {
    const result = await firstValueFrom(http.get<any[]>('/api/dashboard'));
    expect(result).toHaveLength(30);
    expect(result[0]).toHaveProperty('label');
    expect(result[0]).toHaveProperty('value');
  });

  it('should return payment records with correct structure', async () => {
    const result = await firstValueFrom(http.get<any[]>('/api/payments'));
    const payment = result[0];
    expect(payment).toHaveProperty('date');
    expect(payment).toHaveProperty('method');
    expect(payment).toHaveProperty('status');
    expect(payment).toHaveProperty('reference');
  });
});
