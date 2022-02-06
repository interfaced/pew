import { Injectable } from '@angular/core';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { mergeWith, Observable, Subject, merge, of, first, shareReplay, takeUntil } from 'rxjs';
import { map, filter, mapTo } from 'rxjs/operators';
import IRBlaster from 'src/types/pew/blaster';

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private isFirstConnect = true;
  private _clients: IRBlaster[] = [];
  private _clients$: Observable<boolean> = of(false);
  private _renew$ = new Subject();

  constructor(
    private _mqttService: MqttService
  ) {
  }

  connect(optUrl?: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this._mqttService.onConnect
        .pipe(first())
        .subscribe((a) => {
          resolve(true);
        });

      this._mqttService.onError
        .pipe(first())
        .subscribe((error) => {
          reject(error);
        });

      if (!this.isFirstConnect) {
        this._mqttService.disconnect(true);
      }

      this.isFirstConnect = false;
      this._mqttService.connect(optUrl ? {
        url: optUrl
      } : undefined);
    })
  }

  scan() {
    const extractBlasterNameFromTopic = (topic: string) => {
      const exp = /\/irblaster\/([^/]+)\/?/;
      if (exp.test(topic)) {
        return (exp.exec(topic) as string[])[1];
      }

      return '';
    };

    const addClient$ = this._mqttService.observe('/irblaster/+')
      .pipe(map((message: IMqttMessage) => {
        console.log('+', message.topic, message.payload + '');
        const deviceName = extractBlasterNameFromTopic(message.topic);
        if (deviceName && this._clients.every(blaster => deviceName.indexOf(blaster.id) !== -1)) {
          try {
            console.log(deviceName);
            const blaster = new IRBlaster(this._mqttService, deviceName, JSON.parse(message.payload + ''));
            this._clients.push(blaster);
            blaster.output$.subscribe(console.log);
            return true;
          } catch (e) {
            return false;
          }
        }

        return false;
      }), filter(Boolean));

    const deleteClient$ = this._mqttService.observe('/irblaster/+/disconnect')
      .pipe(map((message: IMqttMessage) => {
        console.log('+', message.topic, message.payload + '');
        const deviceName = extractBlasterNameFromTopic(message.topic);
        const index = this._clients.findIndex((client) => deviceName.indexOf(client.id) !== -1);
        if (index >= 0) {
          this._clients.splice(index, 1);
          return true;
        }

        return false;
      }));

    this._renew$.next(null);
    this._clients$ = merge(addClient$, deleteClient$)
      .pipe(takeUntil(this._renew$));

    this._mqttService.unsafePublish('/irblaster/ping', '', { qos: 1, retain: true });
  }

  test() {
    this.clients$.subscribe((a) => console.log(a));
  }

  get clients$() {
    return this._clients$
      .pipe(
        mapTo(this._clients),
        shareReplay(1)
      );
  }

  public ngOnDestroy() {
  }
}
