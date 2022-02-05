import {Client as MqttClient, connect} from 'mqtt';
import {IIRBlaster} from './blaster.d';
import IRBlaster from './blaster.js';

const ReservedTopics = ['ping'];
type OnBlasterCallback = (IRBlaster) => void

class IRBlasterScanner implements IRBlasterScanner {
	_callback: OnBlasterCallback
	_clients: IIRBlaster[]
	mqttClient: MqttClient

	constructor(mqttServerIp, callback) {
		this._callback = callback;
		this._clients = [];
		const clientNames = [];

		const options = {
			clean: true,
			connectTimeout: 4000,
			clientId: 'blaster-server'
		};

		this.mqttClient = connect(`mqtt://${mqttServerIp}`, options);

		this.mqttClient.once('connect', () => {
			this.mqttClient.subscribe('/irblaster/+');
			this.mqttClient.publish('/irblaster/ping', '');
			this.mqttClient.on('message', (topic, message) => {
				const deviceName = topic.split('/irblaster/')[1];

				if (deviceName && !clientNames.includes(deviceName) && !ReservedTopics.includes(deviceName)) {
					clientNames.push(deviceName);

					const blaster = new IRBlaster(this.mqttClient, deviceName);
					this._clients.push(blaster);
					this._callback(blaster);
				}
			})
		})
	}

	subscribe(callback: OnBlasterCallback) {
		this._callback = callback;
	}

	get(): IIRBlaster[] {
		return this._clients;
	}
}

export default IRBlasterScanner;
