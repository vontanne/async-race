import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { EngineService } from '../../../core/services/engine.service';
import type { Car } from '../../../core/models/car.model';
import type { CarEngineState } from '../../../core/models/engine.model';

export interface RaceResult {
  carId: number;
  time: number; // seconds
}

const MS_PER_SECOND = 1000;

@Component({
  selector: 'app-car-card',
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarCardComponent {
  private readonly engineService = inject(EngineService);
  private readonly destroyRef = inject(DestroyRef);

  readonly car = input.required<Car>();

  readonly edit = output<Car>();
  readonly remove = output<number>();

  readonly engineState = signal<CarEngineState>('idle');
  readonly position = signal<number>(0);

  private animationId: number | null = null;
  private raceDuration = 0;

  readonly canStart = computed(
    () => this.engineState() === 'idle' || this.engineState() === 'broken',
  );
  readonly canStop = computed(
    () => this.engineState() !== 'idle' && this.engineState() !== 'stopping',
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cancelAnimation();
    });
  }

  async startRace(): Promise<RaceResult> {
    this.engineState.set('starting');
    const { velocity, distance } = await firstValueFrom(
      this.engineService.startEngine(this.car().id).pipe(takeUntilDestroyed(this.destroyRef)),
    );
    this.raceDuration = distance / velocity;
    this.engineState.set('driving');
    this.beginAnimation();
    try {
      await firstValueFrom(
        this.engineService.drive(this.car().id).pipe(takeUntilDestroyed(this.destroyRef)),
      );
    } catch {
      this.cancelAnimation();
      this.engineState.set('broken');
      throw new Error(`Car ${this.car().id} engine broke`);
    }
    return { carId: this.car().id, time: this.raceDuration / MS_PER_SECOND };
  }

  async stopEngine(): Promise<void> {
    this.cancelAnimation();
    this.engineState.set('stopping');
    await firstValueFrom(
      this.engineService.stopEngine(this.car().id).pipe(takeUntilDestroyed(this.destroyRef)),
    );
    this.position.set(0);
    this.engineState.set('idle');
  }

  resetPosition(): void {
    this.cancelAnimation();
    this.position.set(0);
    this.engineState.set('idle');
  }

  onStartEngine(): void {
    void this.startRace().catch((err: unknown) => {
      console.warn(err);
    });
  }

  onStopEngine(): void {
    void this.stopEngine().catch((err: unknown) => {
      console.error(err);
    });
  }

  private beginAnimation(): void {
    let startTime: number | null = null;
    const step = (timestamp: number): void => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / this.raceDuration, 1);
      this.position.set(progress);
      if (progress < 1) {
        this.animationId = requestAnimationFrame(step);
      }
    };
    this.animationId = requestAnimationFrame(step);
  }

  private cancelAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}
