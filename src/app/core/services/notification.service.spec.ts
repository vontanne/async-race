import { NotificationService } from './notification.service';

const TIMEOUT_MS = 5000;

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new NotificationService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no notifications', () => {
    expect(service.notifications()).toEqual([]);
  });

  it('error() adds an error notification with a unique id', () => {
    service.error('boom');
    const list = service.notifications();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ message: 'boom', kind: 'error' });
    expect(typeof list[0].id).toBe('number');
  });

  it('info() adds an info-kind notification', () => {
    service.info('fyi');
    expect(service.notifications()[0]).toMatchObject({ message: 'fyi', kind: 'info' });
  });

  it('assigns increasing ids to consecutive notifications', () => {
    service.error('first');
    service.error('second');
    const [a, b] = service.notifications();
    expect(b.id).toBeGreaterThan(a.id);
  });

  it('auto-dismisses a notification after the timeout elapses', () => {
    service.error('temporary');
    expect(service.notifications()).toHaveLength(1);

    vi.advanceTimersByTime(TIMEOUT_MS - 1);
    expect(service.notifications()).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(service.notifications()).toEqual([]);
  });

  it('dismiss(id) removes only the matching notification', () => {
    service.error('first');
    service.info('second');
    const [a] = service.notifications();

    service.dismiss(a.id);

    const remaining = service.notifications();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].message).toBe('second');
  });

  it('manually dismissed notifications are not re-removed by the timer', () => {
    service.error('first');
    const [a] = service.notifications();
    service.dismiss(a.id);

    vi.advanceTimersByTime(TIMEOUT_MS);

    expect(service.notifications()).toEqual([]);
  });
});
