import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MockDataService } from '../services/mock-data.service';

/**
 * Injection token to control simulated latency (in ms).
 * Override to 0 in tests for synchronous responses.
 */
export const MOCK_API_DELAY = new InjectionToken<number>('MOCK_API_DELAY', {
  providedIn: 'root',
  factory: () => Math.floor(Math.random() * 200) + 200,
});

/** Helper: return a mock response, applying delay only when latency > 0 */
function mockResponse<T>(body: T, latency: number): Observable<HttpResponse<T>> {
  const res$ = of(new HttpResponse({ status: 200, body }));
  return latency > 0 ? res$.pipe(delay(latency)) : res$;
}

/**
 * HTTP interceptor that intercepts requests to dummy API URLs
 * and returns mock data as JSON responses.
 *
 * When a real backend is available, simply remove this interceptor
 * from the provider list in app.config.ts — no other code changes needed.
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  const mockData = inject(MockDataService);
  const latency = inject(MOCK_API_DELAY);

  if (req.url.endsWith('/api/payments')) {
    return mockResponse(mockData.generatePayments(50), latency);
  }

  if (req.url.endsWith('/api/chargebacks')) {
    return mockResponse(mockData.generateChargebacks(35), latency);
  }

  if (req.url.endsWith('/api/dashboard')) {
    return mockResponse(mockData.generateDashboardData(30), latency);
  }

  if (req.url.endsWith('/api/returns')) {
    return mockResponse(mockData.generateReturns(), latency);
  }

  // Pass through to real backend for any other URL
  return next(req);
};
