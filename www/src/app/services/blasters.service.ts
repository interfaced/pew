import { Injectable } from '@angular/core';
import { AppState, InitStateService } from '@services/init-state.service';
import { ScannerService } from '@services/scanner.service';
import { BehaviorSubject, noop, Observable, of, Subject } from 'rxjs';
import IRBlaster from 'src/types/pew/blaster';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlastersService {
  public mqttServerUrl: string = '';
  public blasters = new BehaviorSubject([] as IRBlaster[]);

  constructor(
    private stateService: InitStateService,
    private scannerService: ScannerService
  ) { }

  setMqttUrl(url: string) {
    this.mqttServerUrl = url;
  }

  init(): Promise<void> {
    return this.load()
      .then(() => {
        this.scan();

        return;
      })
      .catch(() => {})
  }

  scan() {
    this.scannerService.scan();

    this.scannerService.clients$.subscribe((blasters) => {
      this.blasters.next(blasters);
    });
  }

  load() {
    if (!environment.mqttServer) {
      this.stateService.state.next(AppState.NO_SERVER);

      return Promise.resolve();
    }

    return this.scannerService.connect(this.mqttServerUrl)
      .then(() => {
        this.stateService.state.next(AppState.READY);
      })
      .catch(() => {
        this.stateService.state.next(AppState.NO_SERVER);
      });
  }
}
