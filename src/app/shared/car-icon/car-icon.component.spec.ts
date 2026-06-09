import { TestBed } from '@angular/core/testing';

import { CarIconComponent } from './car-icon.component';

describe('CarIconComponent', () => {
  it('applies the given color to the body and roof rects', () => {
    TestBed.configureTestingModule({ imports: [CarIconComponent] });
    const fixture = TestBed.createComponent(CarIconComponent);
    fixture.componentRef.setInput('color', '#abcdef');
    fixture.detectChanges();

    const rects = fixture.nativeElement.querySelectorAll('rect') as NodeListOf<SVGRectElement>;
    expect(rects).toHaveLength(2);
    rects.forEach((rect) => {
      expect(rect.getAttribute('fill')).toBe('#abcdef');
    });
  });

  it('marks the SVG as aria-hidden', () => {
    TestBed.configureTestingModule({ imports: [CarIconComponent] });
    const fixture = TestBed.createComponent(CarIconComponent);
    fixture.componentRef.setInput('color', '#000');
    fixture.detectChanges();
    const svg = fixture.nativeElement.querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });
});
