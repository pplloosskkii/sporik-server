var LinearRegulator = require('./LinearRegulator')();
var RelayRegulator = require('./RelayRegulator')();
var ZeroRegulator = require('./ZeroRegulator')();

var DEBUG = require('./Debug');
var single;

var DeviceRegulator = function () {
	var data = {
        stafeta: [null, 0, 0, 0]
    };

	return {
		tick: function(Elmer, deviceListObj) {
			var devices = deviceListObj.list(); // devices = instanceof DictionaryJs
			var elmer = Elmer.get();

			if (devices.size() == 0) {
				DEBUG.log('will NOT regulate: no devices');
				return false;
			}
			
			// regulate for each phase
			// for L1 to L3, do: 
			// 		if there is one device, regulate it normally
			//		if there are more devices:
			//			order them by priority
			//			filter out manual ones (do not apply to them)
			//			if there is one left:
			//				regulate it normally
			//			if there are more:
			//				if regulation of first is not 100% and should regulate up or down
			//					regulate first, 
			//					regulate others to zero and skip them
			//				if regulation of first is 100% and should regulate up
			//					skip first (regulate to 100%)
			//					regulate next one
			//					regulate others to zero and skip them
			//				if regulation of first is 100% and should regulate down
			//					regulate first
			//					regulate others to zero and skip them

            function sortByPriority(aa, bb) {
                var a = aa.get();
                var b = bb.get();
                if (a.priority >= 0 && b.priority >= 0 && a.priority < b.priority) return -1;
                if (a.priority >= 0 && b.priority >= 0 && a.priority > b.priority) return 1;
                return 0;
            }

            function getRegulator(deviceObj) {
                var regulator;
                if (deviceObj.isLinear()) {
                    if (deviceObj.get().autorun_max == 0)
                        regulator = ZeroRegulator;
                    else
                    	regulator = LinearRegulator;
                } else {
                    regulator = RelayRegulator;
                }
                return regulator;
            }

            function phaseFunction(device, index, arr) {
                var dd = device.get();
                var reg = getRegulator(device);
                reg.setElmer(elmer);
                var overflow = elmer['overflow'][dd.phase - 1];
                var	elmerReading = (elmer['P' + dd.phase + 'A+'] / 10) || 0;
                if (data.stafeta[dd.phase] == index) {
                    device.setActiveState(true);
                } else {
                    device.setActiveState(false);
                    if (data.stafeta[dd.phase] > arr.length && data.stafeta[dd.phase] > 0) {
                        data.stafeta[dd.phase]--;
                    }
                }
                if (arr.length == 1) {
                    // phase has only one device 
                    reg.regulate(device);
                } else {
                    // phase has more devices
                    // if first is between 0-90, regulate it, set others to 0
                    // if first is > 90 and overflow, dont regulate it, regulate second
                    if (data.stafeta[dd.phase] == 0 && index == 0) {
                        // jsem prvni a mam stafetu
                        if (overflow && dd.regulation == 100) {
                            if (data.stafeta[dd.phase] < (arr.length - 1)) {
                                data.stafeta[dd.phase]++;
                            } else {
                                // there are no more devices!!!
                            }
                        } else {
                            reg.regulate(device);
                        }
                    } else if (data.stafeta[dd.phase] > 0 && data.stafeta[dd.phase] == index) {

                        // jsem jakykoliv dalsi a mam stafetu
                        if (overflow) {
                            if (dd.regulation == 100) {
                                if (data.stafeta[dd.phase] < (arr.length - 1)) {
                                    data.stafeta[dd.phase]++;
                                } else {
                                    // there is no more devices!!!
                                }
                            } 
                        } else {
                            if (dd.regulation == 0 && data.stafeta[dd.phase] > 0) {
                                data.stafeta[dd.phase]--;
                            }
                        }
                        reg.regulate(device);
                    } else if (data.stafeta[dd.phase] < index) {
                        // a nemam stafetu
                        // a ma ji ten pode mnou, mel bych mit nulu!
                        if (!overflow && elmerReading) {
                            reg.regulate(device);
                        }
                    }
                    
                }
                
            }

			// regulate all devices (order by priority, zero is highest priority)
			var deviceList = { l1: [], l2: [], l3: [] };
			devices.forEach(function(key, device) {
                device.recountEnergy();
                if (!device.isRegulable()) return;
				deviceList['l' + device.get().phase].push(device);
            });
            
            deviceList.l1.sort(sortByPriority);
            deviceList.l2.sort(sortByPriority);
            deviceList.l3.sort(sortByPriority);

            deviceList.l1.forEach(phaseFunction);
            deviceList.l2.forEach(phaseFunction);
            deviceList.l3.forEach(phaseFunction);

			// deviceList.forEach(function(device) {
			// 	DEBUG.log("ALIAS:", device.get().address, " PRIO:", device.get().priority);	
			// 	device.recountEnergy();

			// 	if (!device.isRegulable()) return;
			
			// 	if (device.isLinear()) {
			// 		if (device.get().autorun_max == 0)
			// 			regulator = ZeroRegulator;
			// 		else
			// 			regulator = LinearRegulator;
			// 	} else {
			// 		regulator = RelayRegulator;
			// 	}
			// 	if (!device.priority || device.priority == 1) {
			// 		regulator.setElmer(elmer);
			// 		regulator.regulate(device);
			// 	} else {
			// 		setTimeout(function () {
			// 			regulator.setElmer(Elmer.get());
			// 			regulator.regulate(device);
			// 		}, device.priority * 100);
			// 	}
			// });
		}
	}
}

module.exports = function () {
	if (typeof single == 'undefined') {
		return single = new DeviceRegulator();
	} else {
		return single;
	}
}