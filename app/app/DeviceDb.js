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
					'max_consumption': device.max_consumption,
					'is_registered': device.is_registered,
					'autorun_max': device.autorun_max,
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
				var query = connection.query('SELECT * FROM devices WHERE ? ORDER BY priority, phase', params, function(err, result) {
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
		},
		stats: {
			insert: function (deviceData, cb) {
				var insert = {
					device: deviceData.address,
					kwh: deviceData.kWh
				}
				connection.query('INSERT INTO measurements SET ?', insert, function(err, result) {
					if (err) throw new Error(err);
		  			cb && cb(result);
				});
			},
			insertElmerSum: function (deviceData, cb) {
				connection.query('INSERT INTO stats SET ?', deviceData, function(err, result) {
					if (err) throw new Error(err);
		  			cb && cb(result);
				});
			},			
			fetchMonthlyStats: function (device, cb) {
				connection.query("SET @runtot:=0;", "", function () {} );
				connection.query("SELECT q1.min_date, q1.max_date, q1.device, q1.day_total, (@runtot := @runtot + q1.day_total) AS total \
				FROM \
				(SELECT min(created_at) as min_date, max(created_at) as max_date, device, sum(kwh) as day_total \
				FROM `measurements` as m \
				WHERE device = ? \
				AND created_at > NOW() - interval 1 month \
				GROUP BY year(created_at), MONTH(created_at), day(created_at), device) as q1 ORDER by DATE(q1.min_date) ASC", device, function(err, result) {
					if (err) throw new Error(err);
		  			cb && cb(result);
				});
			},
			fetchWeeklyElmerStats: function (cb) {
				connection.query('SELECT q.created_at, q.l1s, q.l2s, q.l3s, q.l1p, q.l2p, q.l3p  \
					FROM stats q WHERE q.created_at > NOW() - interval 1 week ORDER BY q.created_at', function(err, result) {
					if (err) throw new Error(err);
		  			cb && cb(result);
				});
			},	
		},
		weather: {
			insert: function (data, cb) {
				var insert = {
					'rain_total': data.rain_total, 
					'temperature_avg': data.temperature_avg, 
					'temperature_min': data.temperature_min,
					'temperature_max': data.temperature_max,
					'prevalent_wind': data.prevalent_wind,
					'maximum_wind': data.maximum_wind,
					'average_wind': data.average_wind,
				};
				
				connection.query('INSERT INTO weather SET ?', insert, function(err, result) {
					if (err) throw new Error(err);
		  			cb && cb(result);
				});
			},
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