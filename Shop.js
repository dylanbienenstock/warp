/* Listing format:

{
	section: "ships" / "weapons" / "equipment",
	displayName: <string>,
	className: <string>,
	price: <number>
}

*/

module.exports = function(Ship, Weapon, SpecialWeapon) {
	class Shop {
		constructor() {
			this.allListings = [];

			for (var ship in Ship) {
				if (Ship.hasOwnProperty(ship) && Ship[ship].getListing instanceof Function) {
					var listing = Ship[ship].getListing();
					listing.section = "ships";
					listing.id = this.allListings.length;

					this.allListings.push(listing);
				}
			}

			for (var weapon in Weapon) {
				if (Weapon.hasOwnProperty(weapon) && Weapon[weapon].getListing instanceof Function) {
					var listing = Weapon[weapon].getListing();
					listing.section = "weapons";
					listing.id = this.allListings.length;

					this.allListings.push(listing);
				}
			}

			for (var specialWeapon in SpecialWeapon) {
				if (SpecialWeapon.hasOwnProperty(specialWeapon) && SpecialWeapon[specialWeapon].getListing instanceof Function) {
					var listing = SpecialWeapon[specialWeapon].getListing();
					listing.section = "specials";
					listing.id = this.allListings.length;

					this.allListings.push(listing);
				}
			}
		}

		getAllListings() {
			return this.allListings;
		}

		buyShip(player, data) {
			if (Ship.hasOwnProperty(data.className)) {
				var owned = (player.shipListing != undefined && player.shipListing.className == data.className);

				var shipType = Ship[data.className];
				var listing = shipType.getListing();

				if (!owned && player.credits >= listing.price) {
					player.credits -= listing.price;

					player.ship.remove();
					player.ship = new shipType(player);
					player.shouldNetworkShipListing = true;
				}
			}
		}

		buyWeapon(player, data) {
			if (Weapon.hasOwnProperty(data.className)) {
				var owned = (player.primaryWeaponListing != undefined && player.primaryWeaponListing.className == data.className) || 
				(player.secondaryWeaponListing != undefined && player.secondaryWeaponListing.className == data.className);

				var weaponType = Weapon[data.className];
				var listing = weaponType.getListing();

				if (!owned && player.credits >= listing.price) {
					player.credits -= listing.price;

					if (data.primary) {
						if (player.primaryWeapon != undefined) {
							player.primaryWeapon.remove();
						}

						player.primaryWeapon = new weaponType(player);
						player.shouldNetworkPrimaryWeaponListing = true;
					} else {
						if (player.secondaryWeapon != undefined) {
							player.secondaryWeapon.remove();
						}
						
						player.secondaryWeapon = new weaponType(player);
						player.shouldNetworkSecondaryWeaponListing = true;
					}
				}
			}
		}

		buySpecialWeapon(player, data) {
			if (SpecialWeapon.hasOwnProperty(data.className)) {
				var owned = (player.specialWeaponListing != undefined && player.specialWeaponListing.className == data.className);

				var specialWeaponType = SpecialWeapon[data.className];
				var listing = specialWeaponType.getListing();

				if (!owned && player.credits >= listing.price) {
					player.credits -= listing.price;

					if (player.specialWeapon != undefined) {
						player.specialWeapon.remove();
					}

					player.specialWeapon = new specialWeaponType(player);
					player.shouldNetworkSpecialWeaponListing = true;
				}
			}
		}
	}

	return new Shop();
}