
const __DEBUG__ = false;

module.exports = {
	log: function() {
		if (!__DEBUG__) return;

		var args = Array.prototype.slice.call(arguments, 0);
		console.log(args.join(" "));
	},
	error: function () {
		var args = Array.prototype.slice.call(arguments, 0);
		console.log("ERROR!", args.join(" "));	
	}
};
