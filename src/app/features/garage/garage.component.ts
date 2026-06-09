import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, of } from 'rxjs';

import { CarService } from '../../core/services/car.service';
import { WinnerService } from '../../core/services/winner.service';
import { GarageStateService } from './garage-state.service';
import { CarCardComponent, type RaceResult } from './car-card/car-card.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { WinnerBannerComponent } from '../../shared/winner-banner/winner-banner.component';
import { CAR_NAME_PARTS, RANDOM_CARS_COUNT } from '../../core/constants/car-names.constants';
import { GARAGE_PAGE_LIMIT } from '../../core/constants/api.constants';
import type { Car, CarCreate } from '../../core/models/car.model';

const MAX_HEX_COLOR = 0xffffff;
const HEX_COLOR_LENGTH = 6;
const HEX_RADIX = 16;
const DECIMAL_PLACES = 2;
const MAX_NAME_LENGTH = 50;

function generateRandomColor(): string {
  const value = Math.floor(Math.random() * MAX_HEX_COLOR);
  return `#${value.toString(HEX_RADIX).padStart(HEX_COLOR_LENGTH, '0')}`;
}

@Component({
  selector: 'app-garage',
  imports: [CarCardComponent, PaginationComponent, WinnerBannerComponent],
  templateUrl: './garage.component.html',
  styleUrl: './garage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GarageComponent implements OnInit {
  private readonly carService = inject(CarService);
  private readonly winnerService = inject(WinnerService);
  readonly state = inject(GarageStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cars = signal<Car[]>([]);
  readonly totalCars = signal<number>(0);
  readonly isRacing = signal<boolean>(false);
  readonly hasFinishedRace = signal<boolean>(false);
  readonly isGenerating = signal<boolean>(false);
  readonly winnerData = signal<RaceResult | null>(null);
  readonly carCards = viewChildren(CarCardComponent);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCars() / GARAGE_PAGE_LIMIT)),
  );

  readonly winnerCarName = computed(() => {
    const data = this.winnerData();
    if (!data) return '';
    return this.cars().find((c) => c.id === data.carId)?.name ?? '';
  });

  readonly isCreateValid = computed(() => {
    const len = this.state.createName().trim().length;
    return len > 0 && len <= MAX_NAME_LENGTH;
  });

  readonly isEditValid = computed(() => {
    const len = this.state.editName().trim().length;
    return len > 0 && len <= MAX_NAME_LENGTH;
  });

  ngOnInit(): void {
    void this.loadCars();
  }

  onCreateCarClick(): void {
    void this.createCar().catch((err: unknown) => {
      console.error(err);
    });
  }

  onUpdateCarClick(): void {
    void this.updateCar().catch((err: unknown) => {
      console.error(err);
    });
  }

  onDeleteCarClick(id: number): void {
    void this.deleteCar(id).catch((err: unknown) => {
      console.error(err);
    });
  }

  onGenerateClick(): void {
    void this.generateRandomCars().catch((err: unknown) => {
      console.error(err);
    });
  }

  onStartRaceClick(): void {
    void this.startRace().catch((err: unknown) => {
      console.error(err);
    });
  }

  onResetRace(): void {
    this.carCards().forEach((card) => {
      card.resetPosition();
    });
    this.isRacing.set(false);
    this.hasFinishedRace.set(false);
    this.winnerData.set(null);
  }

  onEditCar(car: Car): void {
    this.state.editCar.set(car);
    this.state.editName.set(car.name);
    this.state.editColor.set(car.color);
  }

  onCancelEdit(): void {
    this.state.editCar.set(null);
  }

  onPageChange(page: number): void {
    this.state.page.set(page);
    void this.loadCars();
  }

  onCreateNameInput(event: Event): void {
    this.state.createName.set((event.target as HTMLInputElement).value);
  }

  onCreateColorInput(event: Event): void {
    this.state.createColor.set((event.target as HTMLInputElement).value);
  }

  onEditNameInput(event: Event): void {
    this.state.editName.set((event.target as HTMLInputElement).value);
  }

  onEditColorInput(event: Event): void {
    this.state.editColor.set((event.target as HTMLInputElement).value);
  }

  private async loadCars(): Promise<void> {
    const response = await firstValueFrom(
      this.carService.getCars(this.state.page()).pipe(takeUntilDestroyed(this.destroyRef)),
    );
    this.cars.set(response.body ?? []);
    this.totalCars.set(Number(response.headers.get('X-Total-Count') ?? '0'));
  }

  private async createCar(): Promise<void> {
    if (!this.isCreateValid()) return;
    await firstValueFrom(
      this.carService
        .createCar({ name: this.state.createName().trim(), color: this.state.createColor() })
        .pipe(takeUntilDestroyed(this.destroyRef)),
    );
    this.state.createName.set('');
    await this.loadCars();
  }

  private async updateCar(): Promise<void> {
    const car = this.state.editCar();
    if (!car || !this.isEditValid()) return;
    await firstValueFrom(
      this.carService
        .updateCar(car.id, { name: this.state.editName().trim(), color: this.state.editColor() })
        .pipe(takeUntilDestroyed(this.destroyRef)),
    );
    this.state.editCar.set(null);
    await this.loadCars();
  }

  private async deleteCar(id: number): Promise<void> {
    await firstValueFrom(this.carService.deleteCar(id).pipe(takeUntilDestroyed(this.destroyRef)));
    await firstValueFrom(
      this.winnerService.deleteWinner(id).pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      ),
    );
    if (this.cars().length === 1 && this.state.page() > 1) {
      this.state.page.update((p) => p - 1);
    }
    if (this.state.editCar()?.id === id) this.state.editCar.set(null);
    await this.loadCars();
  }

  private async generateRandomCars(): Promise<void> {
    this.isGenerating.set(true);
    try {
      await Promise.all(
        Array.from({ length: RANDOM_CARS_COUNT }, () =>
          firstValueFrom(this.carService.createCar(this.buildRandomCar())),
        ),
      );
      await this.loadCars();
    } finally {
      this.isGenerating.set(false);
    }
  }

  private async startRace(): Promise<void> {
    const cards = [...this.carCards()];
    if (cards.length === 0) return;
    this.isRacing.set(true);
    this.hasFinishedRace.set(false);
    this.winnerData.set(null);
    try {
      const winner = await Promise.any(cards.map((c) => c.startRace()));
      await this.saveWinner(winner);
      this.winnerData.set(winner);
    } catch {
      // AggregateError — all engines broke, no winner this race
    } finally {
      this.isRacing.set(false);
      this.hasFinishedRace.set(true);
    }
  }

  private async saveWinner(result: RaceResult): Promise<void> {
    const time = parseFloat(result.time.toFixed(DECIMAL_PLACES));
    const existing = await firstValueFrom(this.winnerService.findWinner(result.carId));
    if (existing) {
      await firstValueFrom(
        this.winnerService.updateWinner(result.carId, {
          wins: existing.wins + 1,
          time: Math.min(existing.time, time),
        }),
      );
    } else {
      await firstValueFrom(this.winnerService.createWinner({ id: result.carId, wins: 1, time }));
    }
  }

  private buildRandomCar(): CarCreate {
    const brands = Object.keys(CAR_NAME_PARTS);
    const brand = brands[Math.floor(Math.random() * brands.length)] ?? '';
    const models = CAR_NAME_PARTS[brand] ?? [];
    const model = models[Math.floor(Math.random() * models.length)] ?? '';
    return { name: `${brand} ${model}`, color: generateRandomColor() };
  }
}
