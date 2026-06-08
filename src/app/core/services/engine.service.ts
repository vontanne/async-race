import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../constants/api.constants';
import type { DriveResponse, EngineResponse } from '../models/engine.model';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private readonly http = inject(HttpClient);
  private readonly engineUrl = `${API_BASE_URL}/engine`;

  startEngine(id: number): Observable<EngineResponse> {
    const params = new HttpParams().set('id', id).set('status', 'started');
    return this.http.patch<EngineResponse>(this.engineUrl, null, { params });
  }

  stopEngine(id: number): Observable<EngineResponse> {
    const params = new HttpParams().set('id', id).set('status', 'stopped');
    return this.http.patch<EngineResponse>(this.engineUrl, null, { params });
  }

  drive(id: number): Observable<DriveResponse> {
    const params = new HttpParams().set('id', id).set('status', 'drive');
    return this.http.patch<DriveResponse>(this.engineUrl, null, { params });
  }
}
