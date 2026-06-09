import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';

interface NotificationsStub {
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  dismiss: ReturnType<typeof vi.fn>;
  notifications: () => unknown[];
}

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notifications: NotificationsStub;

  beforeEach(() => {
    notifications = {
      error: vi.fn(),
      info: vi.fn(),
      dismiss: vi.fn(),
      notifications: () => [],
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifications },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function failPlain(url: string, status: number): void {
    http.get(url).subscribe({ next: () => undefined, error: () => undefined });
    httpMock.expectOne(url).flush({}, { status, statusText: 'X' });
  }

  function failWithParams(path: string, params: Record<string, string>, status: number): void {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(params)) p = p.set(k, v);
    http.get(path, { params: p }).subscribe({ next: () => undefined, error: () => undefined });
    httpMock.expectOne((r) => r.url === path).flush({}, { status, statusText: 'X' });
  }

  it('suppresses 404 on /winners/:id (no winner yet)', () => {
    failPlain('/winners/123', 404);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('suppresses 429 on /engine (drive already in progress)', () => {
    failWithParams('/engine', { id: '1', status: 'drive' }, 429);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('suppresses 500 on /engine?status=drive (engine broke down)', () => {
    failWithParams('/engine', { id: '1', status: 'drive' }, 500);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('surfaces 500 on /winners (genuine server error)', () => {
    failPlain('/winners', 500);
    expect(notifications.error).toHaveBeenCalledOnce();
    expect(notifications.error).toHaveBeenCalledWith('Server error (500).');
  });

  it('surfaces network failure (status 0) with a friendly message', () => {
    failPlain('/garage', 0);
    expect(notifications.error).toHaveBeenCalledWith('Cannot reach API server.');
  });

  it('surfaces 4xx as "Request failed"', () => {
    failPlain('/garage/99', 400);
    expect(notifications.error).toHaveBeenCalledWith('Request failed (400).');
  });

  it('does not notify on a successful response', () => {
    http.get('/garage').subscribe();
    httpMock.expectOne('/garage').flush([]);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('does not suppress 404 on non-winners endpoints', () => {
    failPlain('/garage/99', 404);
    expect(notifications.error).toHaveBeenCalled();
  });

  it('does not suppress 500 on /engine?status=started', () => {
    failWithParams('/engine', { id: '1', status: 'started' }, 500);
    expect(notifications.error).toHaveBeenCalled();
  });
});
