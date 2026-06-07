import type { Car } from './car.model';

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerCreate {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerUpdate {
  wins: number;
  time: number;
}

export interface WinnerWithCar extends Winner {
  car: Car;
}

export type SortField = 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';
