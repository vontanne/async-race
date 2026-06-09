import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { GarageComponent } from './garage.component';
import { GarageStateService } from './garage-state.service';

describe('GarageComponent', () => {
  let httpMock: HttpTestingController;
  let state: GarageStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GarageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    state = TestBed.inject(GarageStateService);
  });

  afterEach(() => {
    httpMock.match(() => true).forEach((req) => req.flush([]));
    httpMock.verify();
  });

  function create() {
    const fixture = TestBed.createComponent(GarageComponent);
    fixture.detectChanges();
    httpMock.match(() => true).forEach((req) => req.flush([]));
    return fixture;
  }

  describe('isCreateValid', () => {
    it('is false for an empty name', () => {
      const fixture = create();
      state.createName.set('');
      expect(fixture.componentInstance.isCreateValid()).toBe(false);
    });

    it('is false for a whitespace-only name', () => {
      const fixture = create();
      state.createName.set('   ');
      expect(fixture.componentInstance.isCreateValid()).toBe(false);
    });

    it('is true for a normal name', () => {
      const fixture = create();
      state.createName.set('Tesla');
      expect(fixture.componentInstance.isCreateValid()).toBe(true);
    });

    it('is false for a name longer than 50 characters', () => {
      const fixture = create();
      state.createName.set('x'.repeat(51));
      expect(fixture.componentInstance.isCreateValid()).toBe(false);
    });

    it('is true for a name exactly 50 characters long', () => {
      const fixture = create();
      state.createName.set('x'.repeat(50));
      expect(fixture.componentInstance.isCreateValid()).toBe(true);
    });
  });

  describe('totalPages', () => {
    it('returns at least 1 even when there are no cars', () => {
      const fixture = create();
      fixture.componentInstance.totalCars.set(0);
      expect(fixture.componentInstance.totalPages()).toBe(1);
    });

    it('rounds up partial pages', () => {
      const fixture = create();
      fixture.componentInstance.totalCars.set(8);
      expect(fixture.componentInstance.totalPages()).toBe(2);
    });

    it('returns the exact page count when total divides evenly', () => {
      const fixture = create();
      fixture.componentInstance.totalCars.set(14);
      expect(fixture.componentInstance.totalPages()).toBe(2);
    });
  });
});
