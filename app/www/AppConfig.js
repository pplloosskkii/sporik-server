sporikApp.constant('AppConfig', {
	about: {
		version: '0.4'
	},
	templates: {
		device: './app/www/device/device.html',
		weather: './app/www/weather/weather.html',
		regulationModal: './app/www/device/regulationModal.html',
		configModal: './app/www/device/configModal.html',
		statsModal: './app/www/device/statsModal.html',
		aboutModal: './app/www/about/about.html'
	},
	apiUrl: "http://192.168.1.246:9009/api",
	inverterUrl: "http://192.168.1.246:9009/api/inverter",
	location: {
		lat:50.226898,
		lon:14.156712
	}
});
