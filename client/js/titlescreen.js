var titleScreenBackground;
var titleScreenCircles;
var titleScreenCircleColor = 0xFFFFFF;
var titleScreenCircleOpacity = 1;
var titleScreenCircleDestOpacity = 1;
var titleScreenTransition;
var titleScreenTransitionRadius = 0;
var transitioning = false;
var transitionProgress = 0;
var done = false;
var lastInterfaceColor = "#FFFF00";

window.showNameTags = false;
window.hoveredButton = null;
window.activeButton = null;
window.loginDisabled = false;
window.connected = false;

function setupTitleScreen(titleScreenContainer, gameContainer) {
	titleScreenBackground = new PIXI.Graphics();
	titleScreenCircles = new PIXI.Graphics();
	titleScreenTransition = new PIXI.Graphics();

	gameContainer.mask = titleScreenTransition;

	titleScreenTransition.beginFill(0xFFFFFF);
	titleScreenTransition.drawRect(-2, -2, 1, 1);
	titleScreenTransition.endFill();

	titleScreenContainer.addChild(titleScreenBackground);
}

function updateTitleScreen(baseContainer, titleScreenContainer, gameContainer) {
	if (!done) {
		var ww = $(window).innerWidth();
		var wh = $(window).innerHeight();

		layoutTitleScreen();

		titleScreenBackground.clear();

		titleScreenBackground.beginFill(0x000000);
		titleScreenBackground.drawRect(0, 0, ww, wh);
		titleScreenBackground.endFill();

		drawOscillatingCircles(ww, wh);

		if (transitioning) {
			transitionProgress = lerp(transitionProgress, 1, 0.03);
			titleScreenTransitionRadius = transitionProgress * (ww + wh) / 2;

			titleScreenTransition.clear();

			titleScreenTransition.beginFill(0xFFFFFF);
			titleScreenTransition.drawCircle(ww / 2, wh / 2, titleScreenTransitionRadius);
			titleScreenTransition.endFill();

			titleScreenBackground.lineStyle(2, 0x00FF00);
			titleScreenBackground.drawCircle(ww / 2, wh / 2, titleScreenTransitionRadius + 2);

			if (transitionProgress >= 0.9) {
				transitioning = false;
				done = true;
				gameContainer.mask = null;

				titleScreenContainer.removeChildren();
				baseContainer.removeChild(titleScreenContainer);
				titleScreenBackground.destroy();
				titleScreenCircles.destroy();
				titleScreenTransition.destroy();
			} else if (transitionProgress >= 0.6) {
				window.showNameTags = true;
			}
		}
	} else {
		baseContainer.removeChild(titleScreenContainer);
		$("#title-container").remove();
		$("#notes-container").remove();
		setupHUDMeters();
		$("#chat").stop().animate({ opacity: 0.4 });

		window.inGame = true; // Removes title screen from update loop
	}
}

var awaitingResponse = false;
var minCircleAlpha = 0.2;
var circleIntervals = [
	2000, 4000, 8000
];

function drawOscillatingCircles(ww, wh) {
	titleScreenCircleOpacity = lerp(titleScreenCircleOpacity, titleScreenCircleDestOpacity, 0.1);

	var time = Date.now();
	var minCircleRadius = Math.sqrt(Math.pow($("#title-container").outerWidth(), 2) + Math.pow($("#title-container").outerHeight(), 2)) / 2 + 32;
	var maxCircleRadius = Math.min(ww, wh) / 2 - 32 - minCircleRadius;
	var titleContainerColorRaw = $.Color($("#title-container").css("color"));
	var titleContainerColor = PIXI.utils.rgb2hex([ titleContainerColorRaw.red() / 255, titleContainerColorRaw.green() / 255, titleContainerColorRaw.blue() / 255 ]);

	for (var i = circleIntervals.length - 1; i >= 0; i--) {
		var radius = minCircleRadius + Math.abs(Math.cos(time / circleIntervals[i])) * maxCircleRadius;

		if (!transitioning || radius > titleScreenTransitionRadius) {
			titleScreenBackground.lineStyle(2, titleContainerColor, (minCircleAlpha + (1 - minCircleAlpha) - Math.abs(Math.cos(time / circleIntervals[i])) * (1 - minCircleAlpha)) * titleScreenCircleOpacity);
			titleScreenBackground.drawCircle(ww / 2, wh / 2, radius);
		}
	}
}

$(function() {
	var $buttonContainer = $("#title-button-container");
	window.activeButton = $buttonContainer.find("*:first");

	window.activeButton.css({
		backgroundColor: lastInterfaceColor,
		color: "#000000",
		borderRadius: 10
	});

	$buttonContainer.find("*").hover(function() { 
		if ($(this).attr("id") != window.activeButton.attr("id")) {
			$(this).stop().animate({
				backgroundColor: lastInterfaceColor,
				color: "#000000",
				borderRadius: 10
			}, 150);

			window.activeButton.stop().animate({
				color: lastInterfaceColor,
				backgroundColor: "#000000",
				borderRadius: 10
			}, 150);

			window.hoveredButton = $(this);
		}
	}, function() {
		if ($(this).attr("id") != window.activeButton.attr("id")) {
			$(this).stop().animate({
				color: lastInterfaceColor,
				backgroundColor: "#000000",
				borderRadius: 10
			}, 150);

			window.activeButton.stop().animate({
				backgroundColor: lastInterfaceColor,
				color: "#000000",
				borderRadius: 10
			}, 150);

			window.hoveredButton = null;
		}
	});

	$("*").keyup(function(event) {
		if (event.which == 13 && !awaitingResponse && !window.connected && !window.loginDisabled) {
			awaitingResponse = true;
			connect($("#name-input").val());
		}
	});

	layoutTitleScreen();
});

var setYellowTimeout;

function processResponse(response) {
	var $titleContainer = $("#title-container");
	var $buttonContainer = $("#title-button-container");
	var $othersContainer = $("#others-container");

	if (response.accepted) {
		window.connected = true;

		setInterfaceColor("#00FF00");

		setTimeout(function() {
			transitioning = true;
			$titleContainer.fadeOut();
			$buttonContainer.fadeOut();
			$othersContainer.fadeOut();
			bindControls();
		}, 600);
	} else {
		setInterfaceColor("#FF0000");

		clearTimeout(setYellowTimeout);
		setYellowTimeout = setTimeout(function() {
			setInterfaceColor("#FFFF00");
		}, 1000);
	}

	$("#help-message").text(response.message);
	awaitingResponse = false;
}

function setInterfaceColor(color) {
	var $titleContainer = $("#title-container");
	var $buttonContainer = $("#title-button-container");

	if (color != lastInterfaceColor) {
		$buttonContainer.find("*").stop().animate({
			color: color,
			backgroundColor: "#000000",
			borderColor: color
		}, 600);

		if (window.hoveredButton != null) {
			window.hoveredButton.stop().animate({
				color: "#000000",
				backgroundColor: color,
				borderColor: color,
				borderRadius: 10
			}, 600);
		}

		$titleContainer.stop().animate({
			color: color
		}, 600, function() {
			setTimeout(function() {
				if (fadeOut) {
					$buttonContainer.fadeOut();
					$titleContainer.fadeOut();
					bindControls();

					transitioning = true;
				}
			}, 600);
		});
	}

	lastInterfaceColor = color;
}

function layoutTitleScreen() {
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();
	var $titleContainer = $("#title-container");
	var $othersContainer = $("#others-container");

	var $controls = $("#controls");
	var $controlsUsed = $("#controls-used");

	$titleContainer.offset({
		left: Math.floor(ww / 2 - $titleContainer.outerWidth() / 2),
		top:  Math.floor(wh / 2 - $titleContainer.outerHeight() / 2),
	});

	$othersContainer.offset({
		left:  Math.floor(ww / 2 - $othersContainer.outerWidth() / 2),
		top:  Math.floor(wh / 2 - $othersContainer.outerHeight() / 2),
	});

	$controls.css({
		width: $(window).innerWidth() / 1920 * 1500
	});

	$controlsUsed.css({
		width: $controls.width(),
		height: $controls.height(),
		opacity: Math.sin(Date.now() / 300) * 0.25 + 0.75
	});

	$controlsUsed.offset($controls.offset());

	$("#name-input").css({
		borderBottom: "2px solid " + $titleContainer.css("color")
	});
}

function clickTitleButton(id) {
	setInterfaceColor("#FFFF00");

	var $titleContainer = $("#title-container");
	var $othersContainer = $("#others-container");
	var $button = $("#title-button-" + id);
	window.activeButton = $button;

	if (id == "log-in") {
		titleScreenCircleDestOpacity = 1;
		window.loginDisabled = false;
		$("#name-input").focus();

		$othersContainer.stop().animate({
			opacity: 0
		}, 250, function() {
			$titleContainer.stop().animate({
				opacity: 1
			});
		});
	} else {
		titleScreenCircleDestOpacity = 0.4;
		window.loginDisabled = true;

		$titleContainer.stop().animate({
			opacity: 0
		}, 250, function() {
			$othersContainer.stop().animate({
				opacity: 1
			});
		});

		if (id == "controls") {

		}
	}
}