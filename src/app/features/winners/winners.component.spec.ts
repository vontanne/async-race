import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WinnersComponent } from './winners.component';
import { WinnersStateService } from './winners-state.service';

describe('WinnersComponent', () => {
  let httpMock: HttpTestingController;
  let state: WinnersStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WinnersComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    state = TestBed.inject(WinnersStateService);
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => req.flush([]));
    httpMock.verify();
  });

  function create() {
    const fixture = TestBed.createComponent(WinnersComponent);
    fixture.detectChanges();
    httpMock.match(() => true).forEach((req) => req.flush([]));
    return fixture;
  }

  it('getRowNumber returns position relative to the current page', () => {
    const fixture = create();

    state.page.set(1);
    expect(fixture.componentInstance.getRowNumber(0)).toBe(1);
    expect(fixture.componentInstance.getRowNumber(4)).toBe(5);

    state.page.set(3);
    expect(fixture.componentInstance.getRowNumber(0)).toBe(21);
    expect(fixture.componentInstance.getRowNumber(9)).toBe(30);
  });

  it('ariaSort returns "none" when the column is not the active sort', () => {
    const fixture = create();
    state.sort.set('wins');
    expect(fixture.componentInstance.ariaSort('time')).toBe('none');
  });

  it('ariaSort reflects ASC / DESC order on the active column', () => {
    const fixture = create();
    state.sort.set('wins');

    state.order.set('ASC');
    expect(fixture.componentInstance.ariaSort('wins')).toBe('ascending');

    state.order.set('DESC');
    expect(fixture.componentInstance.ariaSort('wins')).toBe('descending');
  });

  it('onSortChange toggles direction when the same column is clicked', () => {
    const fixture = create();
    state.sort.set('wins');
    state.order.set('ASC');

    fixture.componentInstance.onSortChange('wins');

    expect(state.order()).toBe('DESC');
  });

  it('onSortChange switches column and resets order to ASC + page to 1', () => {
    const fixture = create();
    state.page.set(3);
    state.sort.set('wins');
    state.order.set('DESC');

    fixture.componentInstance.onSortChange('time');

    expect(state.sort()).toBe('time');
    expect(state.order()).toBe('ASC');
    expect(state.page()).toBe(1);
  });
});
