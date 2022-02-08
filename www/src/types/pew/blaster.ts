import {IMqttMessage, MqttService} from 'ngx-mqtt';
import {Protocols, EventType, FriendlyName, LocalTopics, BlasterTopics, BlasterStatus, EventSignal as RawEventSignal, EventSleep as RawEventSleep, CommandType} from "./types";
import { BehaviorSubject, catchError, Observable, of, shareReplay } from 'rxjs';
import { filter, map } from 'rxjs/operators';


export class EventSleep {
  ms: number

  constructor({ms}: {ms: number}) {
    this.ms = ms;
  }
}

export class EventSignal {
  public protocol: Protocols;
  public code: string;
  public nbits: number;

  constructor({protocol, code, nbits}: {protocol: Protocols, code: string, nbits: number}) {
    this.protocol = protocol;
    this.code = code;
    this.nbits = nbits;
  }
}

export class BlasterEvent<T = EventSleep|EventSignal> {
  type: EventType
  data: T

  constructor({type, data}: {type: EventType, data: T}) {
    this.type = type;
    this.data = data;
  }

  toJSON() {
    return this.toString();
  }

  toString() {
    const result: {
      type: number;
      protocol?: number;
      code?: string;
      nbits?: number;
	  ms?: number;
    } = {
      'type': this.type
    };

    if (this.data instanceof EventSignal) {
      result['code'] = this.data.code;
      result['protocol'] = this.data.protocol;
      result['nbits'] = this.data.nbits;
    }

	if (this.data instanceof EventSleep) {
		result['ms'] = this.data.ms;
	}

    return result;
  }
}

export type BlasterEventConfig = BlasterEvent[];

const parsePayload = <T>(payload: IMqttMessage['payload']):T => {
  let parsed = null;
  try {
    parsed = JSON.parse('' + payload);
  } catch (e) {
    // noop
  }

  return parsed;
};



class IRBlaster {
  public status$: BehaviorSubject<BlasterStatus|null>;
  public output$: Observable<BlasterEvent>;
  public _id: string
  private _mqttService: MqttService;
  private _deviceName: string;
  private _friendlyName: string
  private _topics: LocalTopics<FriendlyName>

  constructor(mqttClient: MqttService, name: string, data: object|BlasterStatus) {
    const requiredKeys = ['mode', 'capabilities'];
    // check for BlasterStatus keys
    if (requiredKeys.some((key) => !(key in data))) {
      throw new Error('Bad data');
    }

    this._mqttService = mqttClient;

    this._deviceName = name;

    const [friendlyName, id] = name.split('::');
    this._friendlyName = friendlyName;
    this._id = id || '';

    this._topics = {
      [BlasterTopics.INPUT]: `/irblaster/${this._deviceName}/input`,
      [BlasterTopics.OUTPUT]: `/irblaster/${this._deviceName}/output`,
      [BlasterTopics.GET]: `/irblaster/${this._deviceName}/get`,
      [BlasterTopics.SET]: `/irblaster/${this._deviceName}/set`,
      [BlasterTopics.CONTROL]: `/irblaster/${this._deviceName}/control`,
      [BlasterTopics.DISCONNECT]: `/irblaster/${this._deviceName}/disconnect`,
      [BlasterTopics.MAIN]: `/irblaster/${this._deviceName}`
    };

    this.status$ = new BehaviorSubject<BlasterStatus|null>(data as BlasterStatus);
    this._mqttService.observe(this._topic(BlasterTopics.MAIN))
      .pipe(map(({payload}) => parsePayload<BlasterStatus>(payload))).subscribe(this.status$);

    this.output$ = this._mqttService.observe(this._topic(BlasterTopics.OUTPUT))
      .pipe(
        map(({payload}) => parsePayload<RawEventSignal|RawEventSleep>(payload)),
        map((rawEvent: RawEventSignal|RawEventSleep) => {
          switch (rawEvent.type) {
            case EventType.EVENT_SIGNAL:
              return new BlasterEvent({
                type: EventType.EVENT_SIGNAL,
                data: new EventSignal({
                  protocol: rawEvent.protocol,
                  code: rawEvent.code,
                  nbits: rawEvent.nbits
                })
              });
            case EventType.EVENT_SLEEP:
              return new BlasterEvent({
                type: EventType.EVENT_SLEEP,
                data: new EventSleep({
                  ms: rawEvent.ms,
                })
              });
            default:
              return null;
          }
        }),
        catchError(() => of(null)),
        filter(Boolean)
      );
  }

  send(events: BlasterEventConfig) {
    this._mqttService.unsafePublish(this._topic(BlasterTopics.INPUT), JSON.stringify(events), {qos: 1});
  }

  setStatus(status: Partial<BlasterStatus>) {
    return this._publishTopic(BlasterTopics.SET, status);
  }

  sendControlCommand(type: CommandType) {
    return this._publishTopic(BlasterTopics.CONTROL, {type});
  }

  requestStatus() {
    return this._publishTopic(BlasterTopics.GET);
  }

  get deviceName(): string {
    return this._deviceName;
  }

  get name(): string {
    return this._friendlyName;
  }

  get id(): string {
    return this._id;
  }

  _topic(topicName: BlasterTopics): string {
    return this._topics[topicName];
  }

  _publishTopic(topic: BlasterTopics, message?: (object|[]|string)) {
    return this._mqttService.unsafePublish(this._topic(topic), JSON.stringify(message || {}), {qos: 1});
  }
}

export default IRBlaster;
