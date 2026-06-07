export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface DriveResponse {
  success: boolean;
}

export type EngineStatus = 'started' | 'stopped' | 'drive';

export type CarEngineState = 'idle' | 'starting' | 'driving' | 'broken' | 'stopping';
