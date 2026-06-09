import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WinnerService } from './winner.service';
import { API_BASE_URL, WINNERS_PAGE_LIMIT } from '../constants/api.constants';

describe('WinnerService', () => {
  let service: WinnerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WinnerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getWinners sends GET /winners with page, limit, sort and order', () => {
    service.getWinners(2, 'time', 'ASC').subscribe();
    const req = httpMock.expectOne((r) => r.url === `${API_BASE_URL}/winners`);
    expect(req.request.params.get('_page')).toBe('2');
    expect(req.request.params.get('_limit')).toBe(String(WINNERS_PAGE_LIMIT));
    expect(req.request.params.get('_sort')).toBe('time');
    expect(req.request.params.get('_order')).toBe('ASC');
    req.flush([], { headers: { 'X-Total-Count': '0' } });
  });

  it('getWinner sends GET /winners/:id', () => {
    service.getWinner(3).subscribe();
    httpMock.expectOne(`${API_BASE_URL}/winners/3`).flush({ id: 3, wins: 1, time: 2 });
  });

  it('findWinner returns the first matching record from a filtered list query', () => {
    let received: unknown;
    service.findWinner(5).subscribe((r) => {
      received = r;
    });
    const req = httpMock.expectOne((r) => r.url === `${API_BASE_URL}/winners`);
    expect(req.request.params.get('id')).toBe('5');
    req.flush([{ id: 5, wins: 2, time: 1.5 }]);
    expect(received).toEqual({ id: 5, wins: 2, time: 1.5 });
  });

  it('findWinner returns null when the filter response is empty', () => {
    let received: unknown = 'unset';
    service.findWinner(99).subscribe((r) => {
      received = r;
    });
    httpMock.expectOne((r) => r.url === `${API_BASE_URL}/winners`).flush([]);
    expect(received).toBeNull();
  });

  it('createWinner sends POST /winners with body', () => {
    const payload = { id: 1, wins: 1, time: 2 };
    service.createWinner(payload).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/winners` && r.method === 'POST',
    );
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });

  it('updateWinner sends PUT /winners/:id with body', () => {
    service.updateWinner(4, { wins: 5, time: 1 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/winners/4` && r.method === 'PUT',
    );
    expect(req.request.body).toEqual({ wins: 5, time: 1 });
    req.flush({ id: 4, wins: 5, time: 1 });
  });

  it('deleteWinner sends DELETE /winners/:id', () => {
    service.deleteWinner(9).subscribe();
    httpMock
      .expectOne((r) => r.url === `${API_BASE_URL}/winners/9` && r.method === 'DELETE')
      .flush({});
  });
});
