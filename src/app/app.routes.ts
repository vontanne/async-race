import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'garage', pathMatch: 'full' },
  {
    path: 'garage',
    loadComponent: () =>
      import('./features/garage/garage.component').then((m) => m.GarageComponent),
  },
  {
    path: 'winners',
    loadComponent: () =>
      import('./features/winners/winners.component').then((m) => m.WinnersComponent),
  },
  { path: '**', redirectTo: 'garage' },
];
