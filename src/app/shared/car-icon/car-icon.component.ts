import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-car-icon',
  templateUrl: './car-icon.component.html',
  styleUrl: './car-icon.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarIconComponent {
  readonly color = input.required<string>();
}
