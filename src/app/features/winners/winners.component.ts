import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, forkJoin, of } from 'rxjs';

import { CarService } from '../../core/services/car.service';
import { WinnerService } from '../../core/services/winner.service';
import { WinnersStateService } from './winners-state.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { CarIconComponent } from '../../shared/car-icon/car-icon.component';
import { WINNERS_PAGE_LIMIT } from '../../core/constants/api.constants';
import type { Car } from '../../core/models/car.model';
import type { Winner, WinnerWithCar, SortField } from '../../core/models/winner.model';

const MISSING_CAR_COLOR = '#555';

@Component({
  selector: 'app-winners',
  imports: [PaginationComponent, CarIconComponent],
  templateUrl: './winners.component.html',
  styleUrl: './winners.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnersComponent implements OnInit {
  private readonly winnerService = inject(WinnerService);
  private readonly carService = inject(CarService);
  readonly state = inject(WinnersStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly winners = signal<WinnerWithCar[]>([]);
  readonly totalWinners = signal<number>(0);
  readonly isLoading = signal<boolean>(false);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalWinners() / WINNERS_PAGE_LIMIT)),
  );

  ngOnInit(): void {
    void this.loadWinners();
  }

  onPageChange(page: number): void {
    this.state.page.set(page);
    void this.loadWinners();
  }

  onSortChange(field: SortField): void {
    if (this.state.sort() === field) {
      this.state.order.update((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      this.state.sort.set(field);
      this.state.order.set('ASC');
    }
    this.state.page.set(1);
    void this.loadWinners();
  }

  getRowNumber(index: number): number {
    return (this.state.page() - 1) * WINNERS_PAGE_LIMIT + index + 1;
  }

  ariaSort(field: SortField): 'ascending' | 'descending' | 'none' {
    if (this.state.sort() !== field) return 'none';
    return this.state.order() === 'ASC' ? 'ascending' : 'descending';
  }

  private async loadWinners(): Promise<void> {
    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.winnerService
          .getWinners(this.state.page(), this.state.sort(), this.state.order())
          .pipe(takeUntilDestroyed(this.destroyRef)),
      );
      const raw = response.body ?? [];
      this.totalWinners.set(Number(response.headers.get('X-Total-Count') ?? '0'));
      this.winners.set(await this.attachCars(raw));
    } finally {
      this.isLoading.set(false);
    }
  }

  private async attachCars(winners: Winner[]): Promise<WinnerWithCar[]> {
    if (winners.length === 0) return [];
    const cars = await firstValueFrom(
      forkJoin(
        winners.map((winner) =>
          this.carService
            .getCar(winner.id)
            .pipe(
              catchError(() =>
                of<Car>({ id: winner.id, name: '— deleted —', color: MISSING_CAR_COLOR }),
              ),
            ),
        ),
      ).pipe(takeUntilDestroyed(this.destroyRef)),
    );
    return winners.map((winner, idx) => ({
      ...winner,
      car: cars[idx] ?? this.fallbackCar(winner.id),
    }));
  }

  private fallbackCar(id: number): Car {
    return { id, name: '— deleted —', color: MISSING_CAR_COLOR };
  }
}
