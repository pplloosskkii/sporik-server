sporikApp.directive('weather', ['AppConfig', '$timeout', '$http', function(AppConfig, $timeout, $http) {
	return {
		restrict: 'AE',
		replace:false,
		scope: {
		},
		templateUrl: AppConfig.templates.weather,
		link: function(scope, element, attrs) {

			scope.dates = { 
				data: [],
				sunrise: null,
				sunset: null,
			};

			scope.dates.data = [];

			function processWeatherData(weatherData) {
				var data = weatherData.data.product.time.map(function (item) {
					item.from = new Date(item.from);
					item.to = new Date(item.to);
					item.is_night = is_night(item.to);
					item.power = compute_power(item);
					return item;
				})
				data = data.filter(function (i) {
					if ((new Date(i.to) - new Date(i.from)) == 3600000) return true; else return false;
				});
				data.splice(24, data.length - 24);
				scope.dates.data = data;
				
			}

			function processSunriseData(weatherData) {
				if (window.DOMParser) {
					parser = new DOMParser();
					xmlDoc = parser.parseFromString(weatherData.data, "text/xml");
				} else { // IE
					xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = false;
					xmlDoc.loadXML(weatherData.data);
				}
				scope.dates.sunrise = new Date(xmlDoc.getElementsByTagName("sunrise")[0].getAttribute("time"));
				scope.dates.sunset = new Date(xmlDoc.getElementsByTagName("sunset")[0].getAttribute("time"));
			}
			
			function init() {
				var dateObj = new Date();
				var month = dateObj.getUTCMonth() + 1 + ""; //months from 1-12
				var day = dateObj.getUTCDate() + "";
				var year = dateObj.getUTCFullYear() + "";
				var newdate = year + "-" + (month.length == 1 ? "0" + month : month) + "-" + (day.length == 1 ? "0" + day : day);

				$http.get('https://api.met.no/weatherapi/locationforecast/1.9/.json?lat=' + AppConfig.location.lat + '&lon=' + AppConfig.location.lon).then(processWeatherData);
				$http.get('https://api.met.no/weatherapi/sunrise/2.0/?date=' + newdate + '&offset=+01:00&lat=' + AppConfig.location.lat + '&lon=' + AppConfig.location.lon).then(processSunriseData);

			}

			function is_night(toDate) {
				if (!scope.dates.sunrise || !scope.dates.sunset || !toDate) return 0;
				var nextDaySunrise = new Date(scope.dates.sunrise.getTime());
				var nextDaySunset = new Date(scope.dates.sunset.getTime());
				
				nextDaySunrise.setDate(scope.dates.sunrise.getDate() + 1);
				nextDaySunset.setDate(scope.dates.sunset.getDate() + 1);
				
				if ((toDate > scope.dates.sunrise && toDate < scope.dates.sunset)
				|| (toDate > nextDaySunrise && toDate < nextDaySunset)) return 0;
				else return 1;
			};
			
			function compute_power(date) {
				if (date.is_night) return 0;
				var initial = 50;
				var ret = initial;
				if (date && date.location && date.location.cloudiness && date.location.cloudiness.percent) {
					ret = ret * (parseFloat(date.location.cloudiness.percent) / 100);
				}
				return ret;
			}
			
			setInterval(init, 1000 * 60 * 15); // every 15 min
			init();
		}
	}
}]);