var Dictionary = require('dictionaryjs');
var q = require('q');
var Device = require('./Device');
var DeviceDb = require('./DeviceDb')();
var mqtt = require('./MqttClient');
var single;

var DeviceList = function (mqtt) {
	var devices = new Dictionary();
	var mqttRegister = function (address) {
		mqtt.publish('sporik/register', '{"address": "' + address + '"}');
	}

	return {
		list: function () {
			return devices;
		},
		register: function (address, forcePublish) {
			var deferred = q.defer();
			if (!devices.has(address) || forcePublish === true) {
				DeviceDb.device.fetch(address, function (data) {
					if (data && data.length) {
						var newDevice = new Device(data[0]);
						devices.set(address, newDevice);
						mqttRegister(address);
						deferred.resolve(newDevice);
					} else {
						var newDevice = new Device(address); // init default
						devices.set(address, newDevice);
						DeviceDb.device.add(newDevice.get(), function () {
							mqttRegister(address);
							deferred.resolve(newDevice);
						})
					}
				})
			} else {
				deferred.resolve(devices.get(address));
			}
			return deferred.promise;
		},
		reconnectAll: function () {
			DeviceDb.device.list({ 'devices.is_registered': 1 }, function (data) {
				if (data.length) {
					for (var i in data) {
						mqttRegister(data[i].address);
					}
				}
			})
		}
	};
}

module.exports = function (mqtt) {
	if (typeof single == 'undefined') {
		return single = new DeviceList(mqtt);
	} else {
		return single;
	}
}