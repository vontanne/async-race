import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EngineService } from './engine.service';
import { API_BASE_URL } from '../constants/api.constants';

describe('EngineService', () => {
  let service: EngineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EngineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('startEngine sends PATCH /engine with id and status=started', () => {
    service.startEngine(3).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/engine` && r.method === 'PATCH',
    );
    expect(req.request.params.get('id')).toBe('3');
    expect(req.request.params.get('status')).toBe('started');
    expect(req.request.body).toBeNull();
    req.flush({ velocity: 100, distance: 500_000 });
  });

  it('stopEngine sends PATCH /engine with id and status=stopped', () => {
    service.stopEngine(3).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${API_BASE_URL}/engine`);
    expect(req.request.params.get('status')).toBe('stopped');
    req.flush({ velocity: 0, distance: 500_000 });
  });

  it('drive sends PATCH /engine with id and status=drive', () => {
    service.drive(3).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${API_BASE_URL}/engine`);
    expect(req.request.params.get('status')).toBe('drive');
    req.flush({ success: true });
  });
});
