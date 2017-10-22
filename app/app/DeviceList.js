var single;

var Dictionary = require('dictionaryjs');
var q = require('q');
var Device = require('./Device');
var DeviceDb = require('./DeviceDb')();
var DEBUG = require('./Debug');

var mqttWrapper = require("./MqttWrapper")()

var interval;
var that;

var DeviceList = function () {
	var devices = new Dictionary();
	var mqttRegister = function (address) {
		DEBUG.log("MQTT REGISTER", address);
		mqttWrapper.publish('sporik/register', '{"address": "' + address + '"}');
	}

	return {
		list: function () {
			return devices;
		},
		register: function (address, forcePublish) {
			var deferred = q.defer();

			// if not cached or force-pushed
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
		unregister: function (address) {
			if (devices.has(address)) {
				devices.remove(address);
			}
		},
		reconnectAll: function () {
			DeviceDb.device.list({ 'devices.is_registered': 1 }, function (data) {
				if (data.length) {
					for (var i in data) {
						mqttRegister(data[i].address);
					}
				}
			})
		},
		flushStats: function () {
			// every X min obtain stats and push them to db
			this.list().forEach(function (key, single) {
				var device = single.get();
				DeviceDb.stats.insert({ address: device.address, kWh: device.stats.short.kWh });
				single.resetShortStats();
			});
		},
		flushDailyStats: function () {
			this.list().forEach(function (key, single) {
				single.resetDailyStats();
			});
		}
	};
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new DeviceList();
	} else {
		return single;
	}
}