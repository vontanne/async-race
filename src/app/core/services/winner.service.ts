import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE_URL, WINNERS_PAGE_LIMIT } from '../constants/api.constants';
import type {
  SortField,
  SortOrder,
  Winner,
  WinnerCreate,
  WinnerUpdate,
} from '../models/winner.model';

@Injectable({ providedIn: 'root' })
export class WinnerService {
  private readonly http = inject(HttpClient);
  private readonly winnersUrl = `${API_BASE_URL}/winners`;

  getWinners(page: number, sort: SortField, order: SortOrder): Observable<HttpResponse<Winner[]>> {
    const params = new HttpParams()
      .set('_page', page)
      .set('_limit', WINNERS_PAGE_LIMIT)
      .set('_sort', sort)
      .set('_order', order);

    return this.http.get<Winner[]>(this.winnersUrl, { params, observe: 'response' });
  }

  getWinner(id: number): Observable<Winner> {
    return this.http.get<Winner>(`${this.winnersUrl}/${id}`);
  }

  findWinner(id: number): Observable<Winner | null> {
    const params = new HttpParams().set('id', id);
    return this.http
      .get<Winner[]>(this.winnersUrl, { params })
      .pipe(map((list) => list[0] ?? null));
  }

  createWinner(winner: WinnerCreate): Observable<Winner> {
    return this.http.post<Winner>(this.winnersUrl, winner);
  }

  updateWinner(id: number, update: WinnerUpdate): Observable<Winner> {
    return this.http.put<Winner>(`${this.winnersUrl}/${id}`, update);
  }

  deleteWinner(id: number): Observable<object> {
    return this.http.delete<object>(`${this.winnersUrl}/${id}`);
  }
}
