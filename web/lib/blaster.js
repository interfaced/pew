/**
 * @enum {string}
 */
const BlasterTopics = {
	INPUT: 'topic-input',
	OUTPUT: 'topic-output',
	GET: 'topic-get',
	SET: 'topic-set',
	MAIN: 'main'
}

class IRBlaster {
	constructor(mqttClient, friendlyName) {
		this.friendlyName = friendlyName;
		this.mqttClient = mqttClient

		this.topics = {
			[BlasterTopics.INPUT]: `/irblaster/${this.friendlyName}/input`,
			[BlasterTopics.OUTPUT]: `/irblaster/${this.friendlyName}/output`,
			[BlasterTopics.GET]: `/irblaster/${this.friendlyName}/get`,
			[BlasterTopics.SET]: `/irblaster/${this.friendlyName}/set`,
			[BlasterTopics.MAIN]: `/irblaster/${this.friendlyName}`
		}

		this.mqttClient.subscribe(this._topic(BlasterTopics.OUTPUT))
	}

	subscribe(callback) {
		this._onTopic(BlasterTopics.OUTPUT, callback);
	}

	send(event) {
		this._publishTopic(BlasterTopics.INPUT, event.toString())
	}

	setStatus(status) {
		this._publishTopic(BlasterTopics.SET, JSON.stringify(status))
	}

	getStatus() {
		this._publishTopic(BlasterTopics.GET);

		return new Promise((resolve) => {
			this._onceTopic(BlasterTopics.MAIN, resolve);
		});
	}

	getName() {
		return this.friendlyName;
	}

	/**
	 * @param {BlasterTopics} topicName
	 * @protected
	 */
	_topic(topicName) {
		return this.topics[topicName];
	}

	/**
	 * @param {BlasterTopics} topic
	 * @param {string=} message
	 * @protected
	 */
	_publishTopic(topic, message) {
		this.mqttClient.publish(this._topic(topic), message);
	}

	/**
	 * @param {BlasterTopics} targetTopic
	 * @param {Function} callback
	 * @protected
	 */
	_onTopic(targetTopic, callback) {
		this.mqttClient.on('message', (topic, message) => {
			if (topic === this._topic(targetTopic)) {
				callback(message.toString());
			}
		})
	}

	/**
	 * @param {BlasterTopics} targetTopic
	 * @param {Function} callback
	 * @protected
	 */
	_onceTopic(targetTopic, callback) {
		this.mqttClient.once('message', (topic, message) => {
			if (topic === this._topic(targetTopic)) {
				callback(message.toString());
			}
		})
	}
}

export default IRBlaster;
