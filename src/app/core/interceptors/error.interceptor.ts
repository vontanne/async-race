import { inject } from '@angular/core';
import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

const HTTP_NOT_FOUND = 404;
const HTTP_TOO_MANY_REQUESTS = 429;
const HTTP_INTERNAL_SERVER_ERROR = 500;

function isExpected(err: HttpErrorResponse, url: string): boolean {
  // 404 on GET /winners/:id is the documented "no winner yet" signal.
  if (err.status === HTTP_NOT_FOUND && url.includes('/winners/')) return true;
  // 429 on /engine?status=drive is the documented "drive already in progress" signal.
  if (err.status === HTTP_TOO_MANY_REQUESTS && url.includes('/engine')) return true;
  // 500 on /engine?status=drive is the documented "engine broke down" gameplay event.
  if (
    err.status === HTTP_INTERNAL_SERVER_ERROR &&
    url.includes('/engine') &&
    url.includes('status=drive')
  ) {
    return true;
  }
  return false;
}

function summarise(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Cannot reach API server.';
  if (err.status >= HTTP_INTERNAL_SERVER_ERROR) return `Server error (${err.status}).`;
  return `Request failed (${err.status}).`;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && !isExpected(err, req.urlWithParams)) {
        notifications.error(summarise(err));
      }
      return throwError(() => err);
    }),
  );
};
