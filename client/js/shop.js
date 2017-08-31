window.shopCreated = false;
window.shopOpen = false;

$(function() {
	$(window).resize(centerShop);
});

function toggleShop() {
	if (window.shopOpen) {
		closeShop();
	} else {
		openShop();
	}
}

function openShop() {
	if (!window.shopOpen) {
		if (!window.shopCreated) {
			createShop();
		}

		$("#shop-container").css({
			display: "initial"
		});

		for (var control in ENT.localPlayer.controls) {
			if (ENT.localPlayer.controls.hasOwnProperty(control)) {
				sendControl(control, false);
			}
		}
	}
	
	window.shopOpen = true;
}

function closeShop() {
	$("#shop-container").css({
		display: "none"
	});

	window.shopOpen = false;
}

function createShop() {
	window.shopCreated = true;

	$("#shop-container").load("shop.html", function() {
		centerShop();
	});
}

function centerShop() {
	var $shop = $("#shop-container");
	var $shopClose = $("#shop-close");

	$shop.offset({
		left: $(window).innerWidth() / 2 - $shop.outerWidth() / 2,
		top: $(window).innerHeight() / 2 - $shop.outerHeight() / 2
	});

	$shopClose.offset({
		left: $shop.offset().left + $shop.innerWidth() - $shopClose.outerWidth() - 5,
		top: $shop.offset().top - 4
	});
}