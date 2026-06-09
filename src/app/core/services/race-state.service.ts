import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { WinnerService } from './winner.service';
import type { Raceable, RaceResult } from '../models/race.model';

const DECIMAL_PLACES = 2;

@Injectable({ providedIn: 'root' })
export class RaceStateService {
  private readonly winnerService = inject(WinnerService);

  readonly isRacing = signal<boolean>(false);
  readonly hasFinishedRace = signal<boolean>(false);
  readonly winnerData = signal<RaceResult | null>(null);

  async start(cars: readonly Raceable[]): Promise<void> {
    if (cars.length === 0) return;
    this.isRacing.set(true);
    this.hasFinishedRace.set(false);
    this.winnerData.set(null);
    try {
      const raw = await Promise.any(cars.map((c) => c.startRace()));
      const winner: RaceResult = { ...raw, time: roundTime(raw.time) };
      await this.saveWinner(winner);
      this.winnerData.set(winner);
    } catch {
      // AggregateError — all engines broke, no winner this race
    } finally {
      this.isRacing.set(false);
      this.hasFinishedRace.set(true);
    }
  }

  reset(cars: readonly Raceable[]): void {
    cars.forEach((c) => {
      c.resetPosition();
    });
    this.isRacing.set(false);
    this.hasFinishedRace.set(false);
    this.winnerData.set(null);
  }

  dismissWinner(): void {
    this.winnerData.set(null);
  }

  private async saveWinner(result: RaceResult): Promise<void> {
    const existing = await firstValueFrom(this.winnerService.findWinner(result.carId));
    if (existing) {
      await firstValueFrom(
        this.winnerService.updateWinner(result.carId, {
          wins: existing.wins + 1,
          time: Math.min(existing.time, result.time),
        }),
      );
    } else {
      await firstValueFrom(
        this.winnerService.createWinner({ id: result.carId, wins: 1, time: result.time }),
      );
    }
  }
}

function roundTime(seconds: number): number {
  return parseFloat(seconds.toFixed(DECIMAL_PLACES));
}
