import { Injectable, signal } from '@angular/core';

import type { Car } from '../../core/models/car.model';

const DEFAULT_COLOR = '#e53935';

@Injectable({ providedIn: 'root' })
export class GarageStateService {
  readonly page = signal<number>(1);
  readonly createName = signal<string>('');
  readonly createColor = signal<string>(DEFAULT_COLOR);
  readonly editCar = signal<Car | null>(null);
  readonly editName = signal<string>('');
  readonly editColor = signal<string>(DEFAULT_COLOR);
}
