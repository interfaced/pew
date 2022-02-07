import { getRandomInt } from '@app/utils/rndm';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BlasterEvent, BlasterEventConfig, EventSignal, EventSleep } from 'src/types/pew/blaster';
import {
  BlasterStatus,
  EventType,
  IRStatus,
  ModeStatus,
  NetworkStatus,
  PowerStatus,
  Protocols
} from 'src/types/pew/types';

import SonyProtocolJSON from 'src/external/protocols/sony.json';
import { Key } from '../types/key';
const Keys = Object.entries(SonyProtocolJSON.keyMap) as [Key, {code: string, nbits: number}][];

class IRBlasterMock {
  public status$: BehaviorSubject<BlasterStatus|null>;
  public output$: Observable<BlasterEvent>;
  public _id: string
  private _friendlyName: string

  constructor(name: string) {
    this._friendlyName = name;
    this._id = name;

    this.status$ = new BehaviorSubject<BlasterStatus|null>(null);
    this.status$.next({
      mode: (Math.floor(Math.random() * 2) == 0) ? ModeStatus.WALL : ModeStatus.TRANSPARENT,
      power: (Math.floor(Math.random() * 2) == 0) ? PowerStatus.ON : PowerStatus.OFF,
      network: (Math.floor(Math.random() * 2) == 0) ? ((Math.floor(Math.random() * 2) == 0) ? NetworkStatus.ONLINE : NetworkStatus.OFFLINE) : NetworkStatus.ONLINE,
      ir: (Math.floor(Math.random() * 2) == 0) ? ((Math.floor(Math.random() * 2) == 0) ? IRStatus.IDLE : IRStatus.BUSY) : IRStatus.PAUSED
    } as BlasterStatus);

    this.output$ = of({} as BlasterEvent);
  }

  send(events: BlasterEventConfig) {
    console.log('Events send', events)
  }

  setStatus(status: Partial<BlasterStatus>): Observable<void> {
    this.status$.next({
      ...this.status$.getValue(),
      ...status
    } as BlasterStatus);

    return of(undefined);
  }

  requestStatus(): Observable<void> {
    return of(undefined);
  }

  get name(): string {
    return this._friendlyName;
  }

  get id(): string {
    return this._id;
  }
}

export function generateBlasters(count: number = getRandomInt(0, 12)): IRBlasterMock[] {
  return new Array(count).fill(0).map((g, i) => new IRBlasterMock(`IRBlaster ${i}`));
}

export function generateEvents(count: number = getRandomInt(0, 24)): BlasterEvent[] {
  let isOdd = false;
  const list = [];

  for (let i=0; i<count; i++) {
    let event;
    if (!isOdd) {
      const selectedKey = Keys[getRandomInt(0, Keys.length - 1)][1];
      console.log(selectedKey)
      event = new BlasterEvent({
        type: EventType.EVENT_SIGNAL,
        data: new EventSignal({
          protocol: Protocols.NEC,
          code: selectedKey.code,
          nbits: 12
        })
      });
    } else {
      event = new BlasterEvent({
        type: EventType.EVENT_SIGNAL,
        data: new EventSleep({
          ms: 150
        })
      });
    }

    isOdd = !isOdd;
    list.push(event);
  }

  return list;
}

export default IRBlasterMock;
