

sporikApp.factory('Elmer2', ['$http', '$q', '$timeout', 'AppConfig', function ($http, $q, $timeout, AppConfig) {
	return {

		data: { ok: false },

		get: function () {
			var deferred = $q.defer();
			$http.get(AppConfig.apiUrl + '/elmer2', { timeout: 3000 }).then(function(data, status, headers, config) {
				this.data.ok = true;
				deferred.resolve(data);
			}.bind(this), deferred.reject);
			return deferred.promise;
		},

		setValues: function (data, obj, callback) {	

      obj.data.o1 = 0;//data.data['overflow'][0] || 0;
			obj.data.o2 = 0;//data.data['overflow'][1] || 0;
      obj.data.o3 = 0;//data.data['overflow'][2] || 0;
      
			obj.data.tp1 = data.data['P1S-'];
			obj.data.tp2 = data.data['P2S-'];
			obj.data.tp3 = data.data['P3S-'];

			obj.data.tc1 = data.data['P1S+'];
			obj.data.tc2 = data.data['P2S+'];
			obj.data.tc3 = data.data['P3S+'];

      var i1 = data.data['P1C+'] * 0.001;
      var i2 = data.data['P2C+'] * 0.001;
      var i3 = data.data['P3C+'] * 0.001;

      var u1 = data.data['P1V+'] * 0.01;
      var u2 = data.data['P2V+'] * 0.01;
      var u3 = data.data['P3V+'] * 0.01;

      var pf1 = data.data['P1PF+'] * 0.001;
      var pf2 = data.data['P2PF+'] * 0.001;
      var pf3 = data.data['P3PF+'] * 0.001;

      obj.data.p1 = -1 * Math.round(u1 * i3 * pf1);
      obj.data.p2 = -1 * Math.round(u2 * i3 * pf2);
      obj.data.p2 = -1 * Math.round(u3 * i3 * pf3);

      obj.data.sumDischarged = Math.round(data.data['PAS+'] * 0.01); // sum used energy total
      obj.data.sumCharged = Math.round(data.data['PAS-'] * 0.01); // sum created energy total

			// obj.data.p1 = Math.round((obj.data.o1 > 0 ? '+' : '-') + "" + (data.data['P1A+']));
			// obj.data.p2 = Math.round((obj.data.o2 > 0 ? '+' : '-') + "" + (data.data['P2A+']));
			// obj.data.p3 = Math.round((obj.data.o3 > 0 ? '+' : '-') + "" + (data.data['P3A+']));

			callback(obj.data);
		},

		getValues: function () {
			return this.data;
		},

		getDailyData: function () {

		},

		process: function (callback) {
			this.get().then(function (data) {
				this.setValues(data, this, callback);
			}.bind(this));
    }

	};
}]);