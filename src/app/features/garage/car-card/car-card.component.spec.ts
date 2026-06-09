import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CarCardComponent } from './car-card.component';
import type { CarEngineState } from '../../../core/models/engine.model';

function createCard() {
  TestBed.configureTestingModule({
    imports: [CarCardComponent],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(CarCardComponent);
  fixture.componentRef.setInput('car', { id: 1, name: 'Tesla', color: '#f00' });
  fixture.detectChanges();
  return fixture;
}

describe('CarCardComponent', () => {
  describe('canStart / canStop computed signals', () => {
    const cases: { state: CarEngineState; canStart: boolean; canStop: boolean }[] = [
      { state: 'idle', canStart: true, canStop: false },
      { state: 'starting', canStart: false, canStop: true },
      { state: 'driving', canStart: false, canStop: true },
      { state: 'broken', canStart: true, canStop: true },
      { state: 'stopping', canStart: false, canStop: false },
    ];

    for (const { state, canStart, canStop } of cases) {
      it(`with engineState='${state}' → canStart=${canStart}, canStop=${canStop}`, () => {
        const fixture = createCard();
        fixture.componentInstance.engineState.set(state);
        expect(fixture.componentInstance.canStart()).toBe(canStart);
        expect(fixture.componentInstance.canStop()).toBe(canStop);
      });
    }
  });

  it('emits edit with the current car when the parent calls onSelect via the Select button', () => {
    const fixture = createCard();
    const emissions: unknown[] = [];
    fixture.componentInstance.edit.subscribe((c) => emissions.push(c));

    const selectBtn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    selectBtn.click();

    expect(emissions).toEqual([{ id: 1, name: 'Tesla', color: '#f00' }]);
  });

  it('emits remove with the current car id when the Delete button is clicked', () => {
    const fixture = createCard();
    const emissions: number[] = [];
    fixture.componentInstance.remove.subscribe((id) => emissions.push(id));

    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    (buttons[1] as HTMLButtonElement).click();

    expect(emissions).toEqual([1]);
  });
});
