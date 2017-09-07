$(function() {
	var meterBoost = new HUDMeter({
		containerId: "meter-boost",
		iconURL: "boost.svg",
		color: "#40FF40",
		value: 100 / 3,
		maxValue: 100,
		segmentCount: 12
	});

	var meterShield = new HUDMeter({
		containerId: "meter-shield",
		iconURL: "shield.svg",
		color: "#0088FF",
		value: 100 / 3 * 2,
		maxValue: 100,
		segmentCount: 12
	});

	var meterHealth = new HUDMeter({
		containerId: "meter-health",
		iconURL: "health.svg",
		color: "#FF4040",
		value: 100,
		maxValue: 100,
		segmentCount: 12
	});

	$("#slider").slider({
		min: 0,
		max: 100,
		value: 100,
		orientation: "vertical",
		slide: function(event, ui) {
			meterBoost.setValue(ui.value / 3);
			meterShield.setValue(ui.value / 3 * 2);
			meterHealth.setValue(ui.value);
		}
	});
});