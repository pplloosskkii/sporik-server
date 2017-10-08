var DEBUG = require('./Debug');

var client;

var MqttWrapper = {
	publish: function (topic, content) {
		DEBUG.log("<-", content, "(", topic, ")");
		client.publish(topic, content);
	},
	on: function (name, event) {
		return client.on(name, event);
	},
	subscribe: function (name) {
		return client.subscribe(name);
	},
}

module.exports = function (mqttClient) {
	if (typeof mqttClient !== 'undefined') {
		client = mqttClient;
	}
	return MqttWrapper;
}