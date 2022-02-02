// JS API:
```javascript
class IRBlaster {
	constructor(mqttServer, frendlyName) {}

	/**
	 * @param {function(EVENT)} callback
	 */
	subscribe(callback) {}

	/**
	 * @param {EVENT} event
	 * @return {Promise}
	 */
	send(event) {}

	/**
	 * @param {STATUS} event
	 * @return {Promise}
	 */
	setStatus(event) {}

	/**
	 * @return {Promise<STATUS>}
	 */
	getStatus(event) {}

	/**
	 * @return {string}
	 */
	getName() {
		return '';
	}
}

class IRBlasterScanner {
	constructor(mqttServer) {
	}

	/**
	 * @param {function(IRBlaster)} callback
	 */
	subscribe(callback) {
	}

	/**
	 * @return {Array<IRBlaster>}
	 */
	get() {
		return [];
	}
}

/** @typedef {{
 * mode: BlasterMode,
 * power: PowerState,
 * network: NetworkState
 * }}
 * // в прозрачном режиме всё, что читает IR Receiver пишется в output
 * // питальник телевизора(сделаю такую реализацию железки)
 * // это если вообще всё круто будет, то сделаю чтоб ethernet кабель можно было отключать
 */
let STATUS = {};

const Platform = {
	PLATFORM_SAMSUNG: 0,
	PLATFORM_LG: 1
};

/** @typedef {{
 * platform: Platform,
 * code: number
 * }}
 */
let EventSignal;

/** @typedef {{
 * ms: number
 * }}
 */
let EventSleep;

/**
 * @enum {string}
 */
const EventType = {
	EVENT_SIGNAL: 'event-signal',
	EVENT_SLEEP: 'event-sleep'
};

/**
 * @enum {string}
 */
const NetworkState = {
	ON: 'network-on',
	OFF: 'network-off',
	OFFLINE: 'network-offline'
};

/**
 * @enum {string}
 */
const PowerState = {
	ON: 'power-on',
	OFF: 'power-off'
};

/**
 * @enum {string}
 */
const BlasterMode = {
	TRANSPARENT: 'transparent-mode',
	WALL: 'wall-mode'
};
```

MQTT API:

* irblaster - рабочее имя нашего устройства (всех устрйоств сразу, название, бренд). потом заменим на какое-то понятное имя.
* %FRIENDLY_NAME% - челвоекопонятно имя устройства из ^[z-a0-9]{1,64}$ Например, webos2016 или tizen2020 чтоб было понятно чем конкретно этот экземпляр управляет

MQTT:
* irblaster/ping - если сюда пишут любое сообщение, то в irblaster/%FRIENDLY_NAME% пишется STATUS
* irblaster/%FRIENDLY_NAME%/get - если сюда пишут любое сообщение, то в irblaster/%FRIENDLY_NAME% пишется STATUS
* irblaster/%FRIENDLY_NAME%/set - пишется STATUS или его часть
* irblaster/%FRIENDLY_NAME%/input - сюда пишем масси EVENT которые бластер должен воспроизвести (через ir transmitter)
* (@fridge: формат массива EVENT: {"events": [[{"type": EventType}, (EventSignal|EventSleep)]]}) (такой формат выбран для упрощения парсинга на стороне прошивки, массив пар позволяет явно задать порядок данных)
* irblaster/%FRIENDLY_NAME%/output - сюда пишется EVENT по одному (считанный через ir receiver)

* железка при старте подписывается на irblaster/ping чтоб сообщать о себе по запросу и сразу же при старте пишет свой статус чтоб не нужно было пинговать вновь появившиеся железки

