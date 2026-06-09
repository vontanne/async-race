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
import { firstValueFrom } from 'rxjs';

import { CarService } from '../../core/services/car.service';
import { WinnerService } from '../../core/services/winner.service';
import { WinnersStateService } from './winners-state.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { WINNERS_PAGE_LIMIT } from '../../core/constants/api.constants';
import type { WinnerWithCar, SortField } from '../../core/models/winner.model';

@Component({
  selector: 'app-winners',
  imports: [PaginationComponent],
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

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalWinners() / WINNERS_PAGE_LIMIT)),
  );

  ngOnInit(): void {
    void this.loadWinners();
  }

  onPageChange(page: number): void {
    this.state.page.set(page);
    void this.loadWinners().catch((err: unknown) => {
      console.error(err);
    });
  }

  onSortChange(field: SortField): void {
    if (this.state.sort() === field) {
      this.state.order.update((o) => (o === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      this.state.sort.set(field);
      this.state.order.set('DESC');
    }
    this.state.page.set(1);
    void this.loadWinners().catch((err: unknown) => {
      console.error(err);
    });
  }

  getRowNumber(index: number): number {
    return (this.state.page() - 1) * WINNERS_PAGE_LIMIT + index + 1;
  }

  private async loadWinners(): Promise<void> {
    const response = await firstValueFrom(
      this.winnerService
        .getWinners(this.state.page(), this.state.sort(), this.state.order())
        .pipe(takeUntilDestroyed(this.destroyRef)),
    );
    const raw = response.body ?? [];
    this.totalWinners.set(Number(response.headers.get('X-Total-Count') ?? '0'));

    const withCars = await Promise.all(
      raw.map(async (winner) => {
        const car = await firstValueFrom(
          this.carService.getCar(winner.id).pipe(takeUntilDestroyed(this.destroyRef)),
        );
        return { ...winner, car };
      }),
    );
    this.winners.set(withCars);
  }
}
