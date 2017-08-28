var titleScreenBackground;
var titleScreenCircles;
var titleScreenCircleColor = 0xFFFFFF;
var titleScreenTransition;
var transitioning = false;
var transitionProgress = 0;
var done = false;

window.showNameTags = false;

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

		centerTitleScreen();

		titleScreenBackground.clear();

		titleScreenBackground.beginFill(0x000000);
		titleScreenBackground.drawRect(0, 0, ww, wh);
		titleScreenBackground.endFill();

		drawOscillatingCircles(ww, wh);

		if (transitioning) {
			transitionProgress = lerp(transitionProgress, 1, 0.01);
			var windowDiagonal = Math.sqrt(ww * ww + wh * wh);

			titleScreenTransition.clear();

			titleScreenTransition.beginFill(0xFFFFFF);
			titleScreenTransition.drawCircle(ww / 2, wh / 2, transitionProgress * windowDiagonal);
			titleScreenTransition.endFill();

			titleScreenBackground.lineStyle(2, 0x00FF00);
			titleScreenBackground.drawCircle(ww / 2, wh / 2, (transitionProgress * windowDiagonal) + 2);

			if (transitionProgress >= 0.8) {
				transitioning = false;
				done = true;
				gameContainer.mask = null;

				titleScreenContainer.removeChildren();
				baseContainer.removeChild(titleScreenContainer);
				titleScreenBackground.destroy();
				titleScreenCircles.destroy();
				titleScreenTransition.destroy();
			} else if (transitionProgress >= 0.4) {
				window.showNameTags = true;
			}
		}
	}
}

var awaitingResponse = false;
var minCircleAlpha = 0.2;
var circleIntervals = [
	4000, 5000, 2000
];

function drawOscillatingCircles(ww, wh) {
	var time = Date.now();
	var minCircleRadius = Math.sqrt(Math.pow($("#title-container").outerWidth(), 2) + Math.pow($("#title-container").outerHeight(), 2)) / 2 + 32;
	var maxCircleRadius = Math.min(ww, wh) / 2 - 32 - minCircleRadius;
	var titleContainerColorRaw = $.Color($("#title-container").css("color"));
	var titleContainerColor = PIXI.utils.rgb2hex([ titleContainerColorRaw.red() / 255, titleContainerColorRaw.green() / 255, titleContainerColorRaw.blue() / 255 ]);

	for (var i = circleIntervals.length - 1; i >= 0; i--) {
		titleScreenBackground.lineStyle(2, titleContainerColor, minCircleAlpha + (1 - minCircleAlpha) - Math.abs(Math.cos(time / circleIntervals[i])) * (1 - minCircleAlpha));
		titleScreenBackground.drawCircle(ww / 2, wh / 2, minCircleRadius + Math.abs(Math.cos(time / circleIntervals[i])) * maxCircleRadius);
	}
}

$(function() {
	$("*").keyup(function(event) {
		if (event.key == "Enter" && !awaitingResponse) {
			awaitingResponse = true;
			connect($("#name-input").val());
		}
	});

	centerTitleScreen();
});

function processResponse(response) {
	var $titleContainer = $("#title-container");

	if (response.accepted) {
		$titleContainer.animate({
			color: "#00FF00"
		}, 600, function() {
			setTimeout(function() {
				$("#title-container").fadeOut();
				bindControls();

				transitioning = true;
			}, 600);
		});
	} else {
		$titleContainer.animate({
			color: "#FF0000"
		}, 600);
	}

	$("#help-message").text(response.message);
	awaitingResponse = false;
}

function centerTitleScreen() {
	var ww = $(window).innerWidth();
	var wh = $(window).innerHeight();
	var $titleContainer = $("#title-container");

	$titleContainer.offset({
		left: ww / 2 - $titleContainer.outerWidth() / 2,
		top: wh / 2 - $titleContainer.outerHeight() / 2,
	});

	$("#name-input").css({
		borderBottom: "2px solid " + $titleContainer.css("color")
	});
}