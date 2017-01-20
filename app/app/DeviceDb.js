var mysql = require('mysql');
var single;

var DeviceDb = function () {
	
	var connection = mysql.createConnection({
	  host     : '192.168.1.99',
	  user     : 'sporik',
	  password : 'sporik',
	  database : 'sporik'
	});

	return {

		device: {
			add: function (device, cb) {
				var insert = {				
					'address': device.address,
					'alias': device.alias,
					'description': device.description,
					'max_consumption': device.maxConsumption,
					'is_registered': device.isRegistered,
				};
				var query = connection.query('INSERT INTO devices SET ? ON DUPLICATE KEY UPDATE devices.address=devices.address;', insert, function(err, result) {
					if (err) throw new Error(err);
		  			cb && cb(result);
				});
			},
			fetch: function (address, cb) {
				var query = connection.query('SELECT * FROM devices WHERE devices.address = ?', address, function(err, result) {
					if (err) throw new Error(err);
					cb && cb(result);
				});

			},
			list: function (params, cb) {
				var query = connection.query('SELECT * FROM devices WHERE ? ORDER BY created_at', params, function(err, result) {
					if (err) throw new Error(err);
					cb && cb(result);
				});
			},
			update: function (address, data, cb) {
				var query = connection.query('UPDATE devices SET ? WHERE devices.address = ?', [ data, address ], function(err, result) {
					if (err) throw new Error(err);
					cb && cb(result);
				});
			}
		}
	};
}

module.exports = function (mqtt) {
	if (typeof single == 'undefined') {
		return single = new DeviceDb(mysql);
	} else {
		return single;
	}
}