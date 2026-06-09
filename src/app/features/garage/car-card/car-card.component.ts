import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { EngineService } from '../../../core/services/engine.service';
import { CarIconComponent } from '../../../shared/car-icon/car-icon.component';
import type { Car } from '../../../core/models/car.model';
import type { CarEngineState } from '../../../core/models/engine.model';
import type { Raceable, RaceResult } from '../../../core/models/race.model';

const MS_PER_SECOND = 1000;

@Component({
  selector: 'app-car-card',
  imports: [CarIconComponent],
  templateUrl: './car-card.component.html',
  styleUrl: './car-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarCardComponent implements Raceable {
  private readonly engineService = inject(EngineService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly zone = inject(NgZone);

  readonly car = input.required<Car>();

  readonly edit = output<Car>();
  readonly remove = output<number>();

  readonly engineState = signal<CarEngineState>('idle');
  private readonly trackEl = viewChild.required<ElementRef<HTMLElement>>('track');

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
      this.stopRunningEngineOnDestroy();
    });
  }

  async startRace(): Promise<RaceResult> {
    this.resetTrack();
    this.engineState.set('starting');
    try {
      const { velocity, distance } = await firstValueFrom(
        this.engineService.startEngine(this.car().id).pipe(takeUntilDestroyed(this.destroyRef)),
      );
      this.raceDuration = distance / velocity;
    } catch (err) {
      this.engineState.set('idle');
      throw err;
    }
    this.engineState.set('driving');
    this.beginAnimation();
    return this.awaitDriveCompletion();
  }

  async stopEngine(): Promise<void> {
    this.cancelAnimation();
    this.engineState.set('stopping');
    try {
      await firstValueFrom(
        this.engineService.stopEngine(this.car().id).pipe(takeUntilDestroyed(this.destroyRef)),
      );
    } finally {
      this.resetTrack();
      this.engineState.set('idle');
    }
  }

  resetPosition(): void {
    this.cancelAnimation();
    this.resetTrack();
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

  private async awaitDriveCompletion(): Promise<RaceResult> {
    try {
      await firstValueFrom(
        this.engineService.drive(this.car().id).pipe(takeUntilDestroyed(this.destroyRef)),
      );
    } catch {
      this.cancelAnimation();
      this.engineState.set('broken');
      throw new Error(`Car ${this.car().id} engine broke`);
    }
    return {
      carId: this.car().id,
      carName: this.car().name,
      time: this.raceDuration / MS_PER_SECOND,
    };
  }

  private beginAnimation(): void {
    const el = this.trackEl().nativeElement;
    let startTime: number | null = null;
    this.zone.runOutsideAngular(() => {
      const step = (timestamp: number): void => {
        startTime ??= timestamp;
        const progress = Math.min((timestamp - startTime) / this.raceDuration, 1);
        el.style.setProperty('--pos', String(progress));
        if (progress < 1) {
          this.animationId = requestAnimationFrame(step);
        }
      };
      this.animationId = requestAnimationFrame(step);
    });
  }

  private cancelAnimation(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private resetTrack(): void {
    this.trackEl().nativeElement.style.setProperty('--pos', '0');
  }

  private stopRunningEngineOnDestroy(): void {
    const state = this.engineState();
    if (state !== 'starting' && state !== 'driving') return;
    // Fire-and-forget; takeUntilDestroyed would cancel immediately so use plain subscribe.
    this.engineService.stopEngine(this.car().id).subscribe({
      error: () => {
        /* swallow — best-effort cleanup */
      },
    });
  }
}
