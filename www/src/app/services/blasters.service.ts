import { Injectable } from '@angular/core';
import { AppState, InitStateService } from '@services/init-state.service';
import { ScannerService } from '@services/scanner.service';
import { BehaviorSubject } from 'rxjs';
import { generateBlasters } from '@mocks/blaster';
import { environment } from '@environments/environment';

import IRBlaster from 'src/types/pew/blaster';

@Injectable({
  providedIn: 'root'
})
export class BlastersService {
  public mqttServerUrl: string = '';
  public blasters = new BehaviorSubject([] as IRBlaster[]);

  constructor(
    private stateService: InitStateService,
    private scannerService: ScannerService
  ) {}

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
    if (environment.fakeMqtt) {
      this.stateService.state.next(AppState.READY);
      this.blasters.next(generateBlasters(5) as unknown as IRBlaster[]);

      return Promise.resolve();
    }

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

  get server() {
    return this.mqttServerUrl || environment.mqttServer;
  }
}
