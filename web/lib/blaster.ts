import {Client as MqttClient} from 'mqtt';
import {Protocols} from './protocols';
import {EventEmitter} from 'events';
import {IIRBlaster} from './blaster.d'

export enum ModeStatus {
	TRANSPARENT,
	WALL
}

export enum PowerStatus {
	ON,
	OFF
}
export enum NetworkStatus {
	ONLINE,
	OFFLINE,
	OFF
}

export type BlasterStatus = {
	mode: ModeStatus;
	power: PowerStatus;
	network: NetworkStatus;
};

enum BlasterTopics {
	INPUT = 'topic-input',
	OUTPUT = 'topic-output',
	GET = 'topic-get',
	SET = 'topic-set',
	MAIN = 'main'
}

type FriendlyName = string;

type LocalTopics<FriendlyName> = {
	[BlasterTopics.INPUT]: string;
	[BlasterTopics.OUTPUT]: string;
	[BlasterTopics.GET]: string;
	[BlasterTopics.SET]: string;
	[BlasterTopics.MAIN]: string;
}

export enum EventType {
	EVENT_SIGNAL,
	EVENT_SLEEP
}

export class EventSleep {
	ms: number

	constructor({ms}) {
		this.ms = ms;
	}
}

export class EventSignal {
	public protocol: Protocols;
	public code: number;

	constructor({protocol, code}) {
		this.protocol = protocol;
		this.code = code;
	}
}

export class BlasterEvent {
	type: EventType
	data: EventSleep|EventSignal

	constructor({type, data}) {
		this.type = type;
		this.data = data;
	}
}

export type BlasterEventConfig = BlasterEvent[];

class IRBlaster extends EventEmitter implements IIRBlaster {
	EVENT_OUTPUT: string
	EVENT_INVALID_MESSAGE: string
	EVENT_MAIN: string
	friendlyName: string
	mqttClient: MqttClient
	topics: LocalTopics<FriendlyName>

	constructor(mqttClient, friendlyName) {
		super();

		this.EVENT_INVALID_MESSAGE = 'event-invalid-message';
		this.EVENT_OUTPUT = 'event-output';
		this.EVENT_MAIN = 'event-main';

		this.friendlyName = friendlyName;
		this.mqttClient = mqttClient;

		this.topics = {
			[BlasterTopics.INPUT]: `/irblaster/${this.friendlyName}/input`,
			[BlasterTopics.OUTPUT]: `/irblaster/${this.friendlyName}/output`,
			[BlasterTopics.GET]: `/irblaster/${this.friendlyName}/get`,
			[BlasterTopics.SET]: `/irblaster/${this.friendlyName}/set`,
			[BlasterTopics.MAIN]: `/irblaster/${this.friendlyName}`
		};

		this.mqttClient.subscribe(this._topic(BlasterTopics.OUTPUT));

		this.mqttClient.on('message', (topic, message) => {
			let parsed = null;
			try {
				parsed = JSON.parse(message);
			} catch (e) {
				// noop
			}

			if (parsed) {
				switch(topic) {
					case this.topics[BlasterTopics.INPUT]:
						this.emit(this.EVENT_OUTPUT, parsed);
						break;
					case this.topics[BlasterTopics.OUTPUT]:
						this.emit(this.EVENT_OUTPUT, parsed as BlasterEvent);
						break;
					case this.topics[BlasterTopics.GET]:
						// TODO or not
						break;
					case this.topics[BlasterTopics.SET]:
						// TODO or not
						break;
					case this.topics[BlasterTopics.MAIN]:
						this.emit(this.EVENT_MAIN, parsed);
						break;
				}
			} else {
				this.emit(this.EVENT_INVALID_MESSAGE, {topic, message})
			}
		})
	}

	send(events: BlasterEventConfig) {
		this._publishTopic(BlasterTopics.INPUT, events);
	}

	setStatus(status: BlasterStatus): Promise<BlasterStatus> {
		this._publishTopic(BlasterTopics.SET, status);

		return new Promise((resolve) => {
			this.once(this.EVENT_MAIN, resolve);
		})
	}

	getStatus(): Promise<BlasterStatus> {
		this._publishTopic(BlasterTopics.GET);

		return new Promise((resolve) => {
			this.once(this.EVENT_MAIN, resolve);
		});
	}

	getName(): string {
		return this.friendlyName;
	}

	_topic(topicName: BlasterTopics): string {
		return this.topics[topicName];
	}

	_publishTopic(topic: BlasterTopics, message?: (object|[]|string)) {
		this.mqttClient.publish(this._topic(topic), JSON.stringify(message || {}));
	}
}

export default IRBlaster;
