import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-winner-banner',
  templateUrl: './winner-banner.component.html',
  styleUrl: './winner-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinnerBannerComponent {
  readonly winnerName = input.required<string>();
  readonly winTime = input.required<number>();
  readonly dismiss = output();
}
