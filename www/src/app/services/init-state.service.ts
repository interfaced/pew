import { Injectable } from '@angular/core';
import { BehaviorSubject, shareReplay } from 'rxjs';

export enum AppState {
  INITIAL = 'initial',
  READY = 'ready',
  NO_SERVER = 'no_server'
}

@Injectable({
  providedIn: 'root'
})
export class InitStateService {
  public state = new BehaviorSubject<AppState>(AppState.INITIAL);

  public state$ = this.state.pipe(
    shareReplay(1)
  )

  constructor() {
  }

  ready() {
    this.state.next(AppState.READY);
  }

  destroy() {
    this.state.next(AppState.INITIAL);
  }
}
