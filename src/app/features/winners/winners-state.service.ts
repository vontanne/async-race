import { Injectable, signal } from '@angular/core';

import type { SortField, SortOrder } from '../../core/models/winner.model';

@Injectable({ providedIn: 'root' })
export class WinnersStateService {
  readonly page = signal<number>(1);
  readonly sort = signal<SortField>('wins');
  readonly order = signal<SortOrder>('DESC');
}
