import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL, GARAGE_PAGE_LIMIT } from '../constants/api.constants';
import type { Car, CarCreate } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly http = inject(HttpClient);
  private readonly garageUrl = `${API_BASE_URL}/garage`;

  getCars(page: number): Observable<HttpResponse<Car[]>> {
    const params = new HttpParams().set('_page', page).set('_limit', GARAGE_PAGE_LIMIT);

    return this.http.get<Car[]>(this.garageUrl, { params, observe: 'response' });
  }

  getCar(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.garageUrl}/${id}`);
  }

  createCar(car: CarCreate): Observable<Car> {
    return this.http.post<Car>(this.garageUrl, car);
  }

  updateCar(id: number, car: CarCreate): Observable<Car> {
    return this.http.put<Car>(`${this.garageUrl}/${id}`, car);
  }

  deleteCar(id: number): Observable<object> {
    return this.http.delete<object>(`${this.garageUrl}/${id}`);
  }
}
