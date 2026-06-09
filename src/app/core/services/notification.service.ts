import { Injectable, signal } from '@angular/core';

const NOTIFICATION_TIMEOUT_MS = 5000;

export interface Notification {
  id: number;
  message: string;
  kind: 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  private nextId = 1;

  error(message: string): void {
    this.push(message, 'error');
  }

  info(message: string): void {
    this.push(message, 'info');
  }

  dismiss(id: number): void {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private push(message: string, kind: 'error' | 'info'): void {
    const id = this.nextId;
    this.nextId += 1;
    this._notifications.update((list) => [...list, { id, message, kind }]);
    setTimeout(() => {
      this.dismiss(id);
    }, NOTIFICATION_TIMEOUT_MS);
  }
}
