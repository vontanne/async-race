import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CarService } from './car.service';
import { API_BASE_URL, GARAGE_PAGE_LIMIT } from '../constants/api.constants';

describe('CarService', () => {
  let service: CarService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getCars sends GET /garage with _page and _limit params and observes the full response', () => {
    service.getCars(3).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${API_BASE_URL}/garage` && r.method === 'GET');
    expect(req.request.params.get('_page')).toBe('3');
    expect(req.request.params.get('_limit')).toBe(String(GARAGE_PAGE_LIMIT));
    req.flush([{ id: 1, name: 'Tesla', color: '#fff' }], {
      headers: { 'X-Total-Count': '1' },
    });
  });

  it('getCar sends GET /garage/:id', () => {
    service.getCar(7).subscribe();
    httpMock
      .expectOne((r) => r.url === `${API_BASE_URL}/garage/7` && r.method === 'GET')
      .flush({ id: 7, name: 'Ford', color: '#000' });
  });

  it('createCar sends POST /garage with body', () => {
    const payload = { name: 'BMW', color: '#abc' };
    service.createCar(payload).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/garage` && r.method === 'POST',
    );
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 1, ...payload });
  });

  it('updateCar sends PUT /garage/:id with body', () => {
    const payload = { name: 'Audi', color: '#bcd' };
    service.updateCar(4, payload).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/garage/4` && r.method === 'PUT',
    );
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 4, ...payload });
  });

  it('deleteCar sends DELETE /garage/:id', () => {
    service.deleteCar(9).subscribe();
    httpMock
      .expectOne((r) => r.url === `${API_BASE_URL}/garage/9` && r.method === 'DELETE')
      .flush({});
  });
});
