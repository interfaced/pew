import {IMqttMessage, MqttService} from 'ngx-mqtt';
import {Protocols, EventType, FriendlyName, LocalTopics, BlasterTopics, BlasterStatus} from "./types";
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';


export class EventSleep {
  ms: number

  constructor({ms}: {ms: number}) {
    this.ms = ms;
  }
}

export class EventSignal {
  public protocol: Protocols;
  public code: number;

  constructor({protocol, code}: {protocol: Protocols, code: number}) {
    this.protocol = protocol;
    this.code = code;
  }
}

export class BlasterEvent<T = EventSleep|EventSignal> {
  type: EventType
  data: T

  constructor({type, data}: {type: EventType, data: T}) {
    this.type = type;
    this.data = data;
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
      .pipe(map(({payload}) => parsePayload<BlasterEvent>(payload)));
  }

  send(events: BlasterEventConfig) {
    this._mqttService.unsafePublish(BlasterTopics.INPUT, JSON.stringify(events), {qos: 1, retain: true});
  }

  setStatus(status: Partial<BlasterStatus>): Observable<void> {
    return this._publishTopic(BlasterTopics.SET, status);
  }

  requestStatus(): Observable<void> {
    return this._publishTopic(BlasterTopics.GET);
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

  _publishTopic(topic: BlasterTopics, message?: (object|[]|string)): Observable<void> {
    return this._mqttService.publish(this._topic(topic), JSON.stringify(message || {}), {qos: 1, retain: true});
  }
}

export default IRBlaster;
