import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RaceStateService } from './race-state.service';
import { WinnerService } from './winner.service';
import type { Raceable, RaceResult } from '../models/race.model';

interface WinnerServiceStub {
  findWinner: ReturnType<typeof vi.fn>;
  createWinner: ReturnType<typeof vi.fn>;
  updateWinner: ReturnType<typeof vi.fn>;
}

function makeWinningCar(id: number, name = `Car ${id}`, time = 2.9585798816568047): Raceable {
  return {
    startRace: vi.fn().mockResolvedValue({ carId: id, carName: name, time }),
    resetPosition: vi.fn(),
  };
}

function makeBrokenCar(id: number): Raceable {
  return {
    startRace: vi.fn().mockRejectedValue(new Error(`Car ${id} broke`)),
    resetPosition: vi.fn(),
  };
}

function makeNeverFinishingCar(): Raceable {
  return {
    startRace: vi.fn().mockReturnValue(new Promise<RaceResult>(() => undefined)),
    resetPosition: vi.fn(),
  };
}

describe('RaceStateService', () => {
  let service: RaceStateService;
  let winners: WinnerServiceStub;

  beforeEach(() => {
    winners = {
      findWinner: vi.fn(),
      createWinner: vi.fn(),
      updateWinner: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: WinnerService, useValue: winners }],
    });
    service = TestBed.inject(RaceStateService);
  });

  describe('initial state', () => {
    it('is idle with no winner and no finished flag', () => {
      expect(service.isRacing()).toBe(false);
      expect(service.hasFinishedRace()).toBe(false);
      expect(service.winnerData()).toBeNull();
    });
  });

  describe('start()', () => {
    it('is a no-op when no cars are provided', async () => {
      await service.start([]);
      expect(service.isRacing()).toBe(false);
      expect(service.hasFinishedRace()).toBe(false);
      expect(winners.findWinner).not.toHaveBeenCalled();
    });

    it('flips isRacing to true while racing and back to false after the winner is saved', async () => {
      let resolveWin!: (r: RaceResult) => void;
      const slowWinPromise = new Promise<RaceResult>((res) => {
        resolveWin = res;
      });
      const car: Raceable = {
        startRace: vi.fn().mockReturnValue(slowWinPromise),
        resetPosition: vi.fn(),
      };
      winners.findWinner.mockReturnValue(of(null));
      winners.createWinner.mockReturnValue(of({ id: 1, wins: 1, time: 2.96 }));

      const racing = service.start([car]);
      await Promise.resolve();
      expect(service.isRacing()).toBe(true);
      expect(service.hasFinishedRace()).toBe(false);
      expect(service.winnerData()).toBeNull();

      resolveWin({ carId: 1, carName: 'Tesla', time: 2.96 });
      await racing;

      expect(service.isRacing()).toBe(false);
      expect(service.hasFinishedRace()).toBe(true);
    });

    it('rounds the winner time to 2 decimal places and exposes it on the signal', async () => {
      winners.findWinner.mockReturnValue(of(null));
      winners.createWinner.mockReturnValue(of({ id: 1, wins: 1, time: 2.96 }));

      await service.start([makeWinningCar(1, 'Tesla', 2.9585798816568047)]);

      expect(service.winnerData()).toEqual({ carId: 1, carName: 'Tesla', time: 2.96 });
    });

    it('creates a new winner record using the rounded time when none exists', async () => {
      winners.findWinner.mockReturnValue(of(null));
      winners.createWinner.mockReturnValue(of({ id: 2, wins: 1, time: 3.14 }));

      await service.start([makeWinningCar(2, 'Ford', 3.14159)]);

      expect(winners.createWinner).toHaveBeenCalledWith({ id: 2, wins: 1, time: 3.14 });
      expect(winners.updateWinner).not.toHaveBeenCalled();
    });

    it('increments wins and stores the better time when a winner already exists', async () => {
      winners.findWinner.mockReturnValue(of({ id: 7, wins: 2, time: 5.0 }));
      winners.updateWinner.mockReturnValue(of({ id: 7, wins: 3, time: 2.96 }));

      await service.start([makeWinningCar(7, 'BMW', 2.9585798816568047)]);

      expect(winners.updateWinner).toHaveBeenCalledWith(7, { wins: 3, time: 2.96 });
      expect(winners.createWinner).not.toHaveBeenCalled();
    });

    it('keeps the existing best time when the new time is worse', async () => {
      winners.findWinner.mockReturnValue(of({ id: 7, wins: 4, time: 1.0 }));
      winners.updateWinner.mockReturnValue(of({ id: 7, wins: 5, time: 1.0 }));

      await service.start([makeWinningCar(7, 'BMW', 9.99)]);

      expect(winners.updateWinner).toHaveBeenCalledWith(7, { wins: 5, time: 1.0 });
    });

    it('picks the first car to resolve as the winner', async () => {
      winners.findWinner.mockReturnValue(of(null));
      winners.createWinner.mockReturnValue(of({ id: 1, wins: 1, time: 2.96 }));

      await service.start([
        makeWinningCar(1, 'Fast', 1),
        makeNeverFinishingCar(),
        makeBrokenCar(3),
      ]);

      expect(service.winnerData()?.carId).toBe(1);
    });

    it('records no winner when every car breaks but still marks the race finished', async () => {
      await service.start([makeBrokenCar(1), makeBrokenCar(2)]);

      expect(service.winnerData()).toBeNull();
      expect(service.isRacing()).toBe(false);
      expect(service.hasFinishedRace()).toBe(true);
      expect(winners.findWinner).not.toHaveBeenCalled();
    });
  });

  describe('reset()', () => {
    it('clears all race signals and asks every car to reset its position', () => {
      const cars = [makeWinningCar(1), makeWinningCar(2)];

      service.reset(cars);

      expect(service.isRacing()).toBe(false);
      expect(service.hasFinishedRace()).toBe(false);
      expect(service.winnerData()).toBeNull();
      cars.forEach((c) => {
        expect(c.resetPosition).toHaveBeenCalledOnce();
      });
    });
  });

  describe('dismissWinner()', () => {
    it('clears only winnerData and leaves hasFinishedRace alone', async () => {
      winners.findWinner.mockReturnValue(of(null));
      winners.createWinner.mockReturnValue(of({ id: 1, wins: 1, time: 2.96 }));
      await service.start([makeWinningCar(1, 'Tesla', 2.96)]);
      expect(service.winnerData()).not.toBeNull();

      service.dismissWinner();

      expect(service.winnerData()).toBeNull();
      expect(service.hasFinishedRace()).toBe(true);
    });
  });
});
