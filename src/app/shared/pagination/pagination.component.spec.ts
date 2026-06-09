import { TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  function createWith(currentPage: number, totalPages: number) {
    TestBed.configureTestingModule({ imports: [PaginationComponent] });
    const fixture = TestBed.createComponent(PaginationComponent);
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.detectChanges();
    return fixture;
  }

  it('prev() emits the previous page number', () => {
    const fixture = createWith(3, 10);
    const emissions: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emissions.push(page));

    fixture.componentInstance.prev();

    expect(emissions).toEqual([2]);
  });

  it('next() emits the next page number', () => {
    const fixture = createWith(3, 10);
    const emissions: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emissions.push(page));

    fixture.componentInstance.next();

    expect(emissions).toEqual([4]);
  });

  it('disables the Prev button on the first page', () => {
    const fixture = createWith(1, 5);
    const prev = fixture.nativeElement.querySelectorAll('button')[0] as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
  });

  it('disables the Next button on the last page', () => {
    const fixture = createWith(5, 5);
    const next = fixture.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement;
    expect(next.disabled).toBe(true);
  });

  it('enables both buttons in the middle of the range', () => {
    const fixture = createWith(3, 5);
    const [prev, next] = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(prev.disabled).toBe(false);
    expect(next.disabled).toBe(false);
  });

  it('renders the current/total label', () => {
    const fixture = createWith(2, 7);
    expect(fixture.nativeElement.textContent).toContain('Page 2 / 7');
  });
});
