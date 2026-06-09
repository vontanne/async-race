export interface RaceResult {
  carId: number;
  carName: string;
  time: number; // seconds
}

export interface Raceable {
  startRace(): Promise<RaceResult>;
  resetPosition(): void;
}
