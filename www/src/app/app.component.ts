import { Component } from '@angular/core';
import { BlastersService } from '@services/blasters.service';
import { AppState, InitStateService } from '@services/init-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public states = AppState;

  constructor(
    public initStateService: InitStateService,
  ) {}
}
