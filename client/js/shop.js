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

		selectShopTab(shopFirstTab, shopPageIds[0]);

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

	window.shopOpen = false;
}

function createShop(callback) {
	window.shopCreated = true;

	$("#shop-container").load("shop.html", function() {
		layoutShop();
		callback();
	});
}

function layoutShop() {
	var $shopVeil = $("#shop-veil");
	var $shopContainer = $("#shop-container");
	var $shopClose = $("#shop-close");
	var $shopBuyWeaponModal = $("#shop-buy-weapon-modal");
	var $shopBuyWeaponModalClose = $("#shop-buy-weapon-modal-close");

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

	$shopBuyWeaponModal.css({
		left: $shopContainer.width() / 2 - $shopBuyWeaponModal.width() / 2,
		top: $shopContainer.height() / 2 - $shopBuyWeaponModal.height() / 2
	});

	$shopBuyWeaponModalClose.offset({
		left: $shopBuyWeaponModal.offset().left + $shopBuyWeaponModal.innerWidth() - $shopClose.outerWidth() - 5,
		top: $shopBuyWeaponModal.offset().top - 0
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
	var listingContainer = document.getElementById("shop-listing-container-" + data.section);

	var listing = document.createElement("div");
	listing.className = "shop-listing-inactive";
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

	if (getLocalPlayerCredits() >= data.price) {
		listingBuyButton.className = "shop-listing-buy";

		switch (data.section) {
			case "ships":
				break;
			case "weapons":
				listingBuyButton.onclick = function() {
					openBuyWeaponModal();
				}

				break;
			case "equipment":
				break;
		}
	} else {
		listingBuyButton.className = "shop-listing-buy-disabled";
	}
}

function openBuyWeaponModal() {
	$("#shop-veil-over").show();
	$("#shop-buy-weapon-modal").show();

	layoutShop();
}

function closeBuyWeaponModal() {
	$("#shop-veil-over").hide();
	$("#shop-buy-weapon-modal").hide();
}