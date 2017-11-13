window.shopCreated = false;
window.shopOpen = false;

var shopTabsCount = 0;
var shopFirstTab = null;
var shopPageIds = [];
var shopFirstListings = [];
var shopListings = {};

$(function() {
	$(window).resize(layoutShop);

	createShop(function() {
		addShopTab("Your ship", "shop-page-your-ship");
		addShopTab("Ships", "shop-page-ships");
		addShopTab("Weapons", "shop-page-weapons");
		addShopTab("Specials", "shop-page-specials");
		addShopTab("Equipment", "shop-page-equipment");
		addShopTab("Upgrades", "shop-page-upgrades");
	});
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

		$("#shop-veil").show();
		layoutShop();

		// TEMP (change 2 to 0)
		selectShopTab(shopFirstTab, shopPageIds[2]);

		shopFirstListings.forEach(function(listingData) {
			selectListing(listingData.listing, listingData.data);
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
	$("#shop-veil").hide();
	closeBuyWeaponModal();

	window.shopOpen = false;
}

function createShop(callback) {
	window.shopCreated = true;

	$("#shop-container").load("shop.html", function() {
		setupShop();
		layoutShop();
		callback();
	});
}

function setupShop() { // TO DO: Pre-load active and disabled images
	$(".shop-pageselector-button").mousedown(function() {
		console.log("asdasd");
		if (!$(this).hasClass("shop-pageselector-button-disabled")) {
			if ($(this).attr("src").includes("previous")) {
				$(this).attr("src", "./img/shop/previous-page-active.svg");
			} else {
				$(this).attr("src", "./img/shop/next-page-active.svg");
			}
		}
	});

	$(".shop-pageselector-button").mouseup(function() {
		if (!$(this).hasClass("shop-pageselector-button-disabled")) {
			var section = $(this).parent().attr("id").split("-");
			section = section[section.length - 1];

			if ($(this).attr("src").includes("previous")) {
				moveListingPage(section, -1);
			} else {
				moveListingPage(section, 1);
			}
		}
	});
}

function moveListingPage(section, direction) {
	console.log(section, direction);

	var maxPageNumber = Math.ceil(shopListings[section].length / 6);
	var listingPageNumberElement = document.getElementById("shop-pageselector-page-" + section);
	var listingPageNumber = Math.max(1, Math.min(maxPageNumber, parseInt(listingPageNumberElement.innerHTML) + direction));
	var firstListingSelected = false;

	listingPageNumberElement.innerHTML = listingPageNumber;

	shopListings[section].forEach(function(listing) {
		if (listing.listingPageNumber == listingPageNumber) {
			$(listing).show();

			if (!firstListingSelected) {
				firstListingSelected = true;
				selectListing(listing, listing.listingData);
			}
		} else {
			$(listing).hide();
		}
	});

	if (listingPageNumber == 1) {
		$("#shop-pageselector-button-previous-" + section).attr("src", "./img/shop/previous-page-disabled.svg");
		$("#shop-pageselector-button-previous-" + section).addClass("shop-pageselector-button-disabled");
	} else {
		$("#shop-pageselector-button-previous-" + section).attr("src", "./img/shop/previous-page.svg");
		$("#shop-pageselector-button-previous-" + section).removeClass("shop-pageselector-button-disabled");
	}

	if (listingPageNumber == maxPageNumber) {
		$("#shop-pageselector-button-next-" + section).attr("src", "./img/shop/next-page-disabled.svg");
		$("#shop-pageselector-button-next-" + section).addClass("shop-pageselector-button-disabled");
	} else {
		$("#shop-pageselector-button-next-" + section).attr("src", "./img/shop/next-page.svg");
		$("#shop-pageselector-button-next-" + section).removeClass("shop-pageselector-button-disabled");
	}
}

function layoutShop() {
	var $shopVeil = $("#shop-veil");
	var $shopContainer = $("#shop-container");
	var $shopClose = $("#shop-close");
	var $shopListingStatsContainer = $(".shop-listing-stats-container");
	var $shopBuyWeaponModal = $("#shop-buy-modal-weapons");
	var $shopBuyWeaponModalClose = $("#shop-buy-modal-close-weapons");
	var $shopBuyWeaponModalReceipt = $("#shop-buy-modal-receipt-weapons");

	$shopVeil.width($(window).innerWidth());
	$shopVeil.height($(window).innerHeight());

	$shopContainer.offset({
		left: $(window).innerWidth() / 2 - $shopContainer.outerWidth() / 2,
		top: $(window).innerHeight() / 2 - $shopContainer.outerHeight() / 2
	});

	$shopClose.offset({
		left: $shopContainer.offset().left + $shopContainer.innerWidth() - $shopClose.outerWidth() - 5,
		top: $shopContainer.offset().top - 0
	});

	$shopListingStatsContainer.each(function(index, element) {
		var $parent = $($(element).parent().get(0));

		$(element).offset({
			left: $parent.offset().left,
			top: $parent.offset().top + 258
		});
	})

	$shopBuyWeaponModal.css({
		left: $shopContainer.width() / 2 - $shopBuyWeaponModal.width() / 2,
		top: $shopContainer.height() / 2 - $shopBuyWeaponModal.height() / 2
	});

	$shopBuyWeaponModalClose.offset({
		left: $shopBuyWeaponModal.offset().left + $shopBuyWeaponModal.innerWidth() - $shopClose.outerWidth() - 5,
		top: $shopBuyWeaponModal.offset().top - 0
	});

	$shopBuyWeaponModalReceipt.css({
		left: $shopBuyWeaponModal.width() / 2 - $shopBuyWeaponModalReceipt.width() / 2,
		top: $shopBuyWeaponModal.height() / 2 - $shopBuyWeaponModalReceipt.height() / 2
	});

	$(".shop-pageselector-container").each(function() {
		var parentOffset = $(this).parent().offset();

		$(this).offset({
			left: parentOffset.left + 12,
			top: parentOffset.top + 372 + 42 / 2 - $(this).outerHeight() / 2
		});
	});
}

function addShopTab(name, pageId) {
	var newShopTab = document.createElement("div");
	newShopTab.className = "shop-tab-inactive";
	newShopTab.id = "shop-tab-" + shopTabsCount;
	newShopTab.innerHTML = name;
	newShopTab.onclick = function() {
		selectShopTab(newShopTab, pageId);
	}

	shopPageIds.push(pageId);

	document.getElementById("shop-tab-container").appendChild(newShopTab);

	if (shopTabsCount == 0) {
		shopFirstTab = newShopTab;
	}

	shopTabsCount++;

	// TEMP
	if (name == "Weapons") {
		shopFirstTab = newShopTab;
	}
}

function selectShopTab(tab, pageId) {
	for (var i = 0; i < shopTabsCount; i++) {
		document.getElementById("shop-tab-" + i).className = "shop-tab-inactive";
	}

	for (var i = 0; i < shopPageIds.length; i++) {
		document.getElementById(shopPageIds[i]).style.display = "none";
	}

	tab.className = "shop-tab-active";
	document.getElementById(pageId).style.display = "initial";

	layoutShop();
}

function addShopListing(data) {
	data.price = data.price || 0;
	data.description = data.description || " ";

	var listingContainer = document.getElementById("shop-listing-container-" + data.section);

	var listing = document.createElement("div");
	listing.className = "shop-listing-inactive";
	listing.listingData = data;
	listing.onclick = function() {
		selectListing(listing, data);
	}

	var listingIcon = document.createElement("img");
	listingIcon.className = "shop-listing-icon";
	listingIcon.src = "./img/shop/" + data.section + ".svg";

	var listingDetailsContainer = document.createElement("div");
	listingDetailsContainer.className = "shop-listing-details-container";

	var listingName = document.createElement("div");
	listingName.className = "shop-listing-name";
	listingName.innerHTML = data.displayName;

	var listingPrice = document.createElement("div");
	listingPrice.className = "shop-listing-price";
	listingPrice.innerHTML = formatCredits(data.price) + " credits";

	listingDetailsContainer.appendChild(listingName);
	listingDetailsContainer.appendChild(listingPrice);
	listing.appendChild(listingIcon);
	listing.appendChild(listingDetailsContainer);
	listingContainer.appendChild(listing);

	if (!shopListings.hasOwnProperty(data.section)) {
		shopListings[data.section] = [];
		shopListings[data.section].push(listing);
		shopFirstListings.push({ listing: listing, data: data });
	} else {
		shopListings[data.section].push(listing);
	}

	listing.listingPageNumber = Math.ceil(shopListings[data.section].length / 6);

	if (listing.listingPageNumber != 1) {
		$(listing).hide();
	}
}

function canBuy(data) {
	var result = { 
		canBuy: false,
		message: "ALREADY OWNED"
	};

	switch (data.section) {
		case "ships":
			result.canBuy = !(ENT.localPlayer.shipListing != undefined && ENT.localPlayer.shipListing.className == data.className);

			break;
		case "weapons":
			result.canBuy = !(ENT.localPlayer.primaryWeaponListing != undefined && ENT.localPlayer.primaryWeaponListing.className == data.className) || 
				   (ENT.localPlayer.secondaryWeaponListing != undefined && ENT.localPlayer.secondaryWeaponListing.className == data.className);

			break;
		case "specials":
			result.canBuy = !(ENT.localPlayer.specialWeaponListing != undefined && ENT.localPlayer.specialWeaponListing.className == data.className);

			break;
		case "equipment":
			var slotAvailable = false;

			for (var i = 0; i < ENT.localPlayer.ship.equipmentSlots; i++) {
				if (ENT.localPlayer.equipmentListings[i] == null) {
					slotAvailable = true;
					break;
				}
			}

			result.canBuy = slotAvailable;
			result.message = "NO ROOM";

			break;
	}

	return result;
}

function selectListing(listing, data) {
	var listingInfo = document.getElementById("shop-listing-info-" + data.section);
	var listingBuyButton = document.getElementById("shop-listing-buy-" + data.section);

	listingInfo.innerHTML = data.description;
	listingBuyButton.innerHTML = "BUY: " + formatCredits(data.price) + " credits";

	shopListings[data.section].forEach(function(listing2) {
		listing2.className = "shop-listing-inactive";
	});

	listing.className = "shop-listing-active";

	var canBuyResult = canBuy(data);

	if (canBuyResult.canBuy && getLocalPlayerCredits() >= data.price) {
		listingBuyButton.className = "shop-listing-buy";

		switch (data.section) {
			case "ships":
				listingBuyButton.onclick = function(event) {
					sendBuyShip(data.className);
					ENT.localPlayer.shipListing = data;
					selectListing(listing, data);

					createCreditsCollectText(data.price, {
						x: event.clientX,
						y: event.clientY
					});
				}

				break;
			case "weapons":
				listingBuyButton.onclick = function() {
					openBuyWeaponModal(listing, data);
				}

				break;
			case "specials":
				listingBuyButton.onclick = function(event) {
					sendBuySpecialWeapon(data.className);
					ENT.localPlayer.specialWeaponListing = data;
					selectListing(listing, data);

					createCreditsCollectText(data.price, {
						x: event.clientX,
						y: event.clientY
					});
				}

				break;
			case "equipment":
				listingBuyButton.onclick = function(event) {
					sendBuyEquipment(data.className);
					ENT.localPlayer.nextEquipmentListing = data;
					selectListing(listing, data);

					createCreditsCollectText(data.price, {
						x: event.clientX,
						y: event.clientY
					});
				}

				break;
		}
	} else {
		listingBuyButton.className = "shop-listing-buy-disabled";
		listingBuyButton.innerHTML = canBuyResult.message;
		listingBuyButton.onclick = null;
	}

	createListingStats(data);
	layoutShop();
}

function createListingStats(data) {
	var container = document.getElementById("shop-listing-stats-container-" + data.section);
	$(container).empty();

	if (data.stats != undefined) {
		var currentLine;
		var lines = [];
		var i = 0;

		for (var stat in data.stats) {
			if (data.stats.hasOwnProperty(stat)) {
				var statLabelContainer = document.createElement("span");

				var statNameLabel = document.createElement("span");
				statNameLabel.className = "shop-listing-stats-label";
				statNameLabel.innerHTML = stat + ": ";

				var statValueLabel = document.createElement("span");
				statValueLabel.innerHTML = replaceZeros(data.stats[stat]);

				if (i % 2 == 0 || i == 1) {
					currentLine = document.createElement("div");
					currentLine.className = "shop-listing-stats";

					lines.push(currentLine);
					container.appendChild(currentLine);

					if (i == 1) {
						i++;
					}
				} else {
					statLabelContainer.style.textAlign = "right";
				}

				statLabelContainer.appendChild(statNameLabel);
				statLabelContainer.appendChild(statValueLabel);
				currentLine.appendChild(statLabelContainer);

				i++;
			}
		}

		lines.reverse();

		for (var i = 0; i < lines.length; i++) {
			if (i == 0) {
				lines[i].className += " shop-listing-stats-bottom";
			}

			if (i % 2 == 0) {
				lines[i].style.backgroundColor = "gray";
			}
		}
	}
}

function openBuyWeaponModal(listing, data) {
	$("#shop-veil-over").show();
	$("#shop-buy-modal-weapons").show();
	$("#shop-buy-modal-content-weapons").css({ visibility: "visible" });
	$("#shop-buy-modal-receipt-weapons").hide();

	var replacePrimaryButton = document.getElementById("shop-buy-weapon-modal-replace-primary");
	var replaceSecondaryButton = document.getElementById("shop-buy-weapon-modal-replace-secondary");

	var completePurchase = function(primary) {
		replacePrimaryButton.onclick = null;
		replaceSecondaryButton.onclick = null;

		$("#shop-buy-modal-content-weapons").css({ visibility: "hidden" });
		$("#shop-buy-modal-receipt-weapons").show();

		layoutShop();

		sendBuyWeapon(data.className, primary);
		closeBuyWeaponModal(true);

		ENT.localPlayer.credits -= data.price;
		ENT.localPlayer[primary ? "primaryWeaponListing" : "secondaryWeaponListing"] = data;
		selectListing(listing, data);
	}

	replacePrimaryButton.onclick = function(event) {
		createCreditsCollectText(data.price, {
			x: event.clientX,
			y: event.clientY
		});

		completePurchase(true);
	}

	replaceSecondaryButton.onclick = function(event) {
		createCreditsCollectText(data.price, {
			x: event.clientX,
			y: event.clientY
		});

		completePurchase(false);
	}

	layoutShop();
}

function closeBuyWeaponModal(purchasedWeapon) {
	if (purchasedWeapon) {
		setTimeout(function() {
			$("#shop-veil-over").fadeOut();
			$("#shop-buy-modal-weapons").fadeOut();
		}, 600);
	} else {
		$("#shop-veil-over").stop().hide();
		$("#shop-buy-modal-weapons").stop().hide();
	}
}