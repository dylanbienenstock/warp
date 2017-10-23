/* Listing format:

{
	section: "ships" / "weapons" / "equipment",
	displayName: <string>,
	className: <string>,
	price: <number>,
	(if equipment) texture: <string>,
	stats: <object>
}

*/

module.exports = function(Ship, Weapon, SpecialWeapon, Equipment) {
	class Shop {
		constructor() {
			this.allListings = [];

			this.createListings(Ship, "ships");
			this.createListings(Weapon, "weapons");
			this.createListings(SpecialWeapon, "specials");
			this.createListings(Equipment, "equipment");
		}

		createListings(section, sectionName) {
			for (var listing in section) {
				if (section.hasOwnProperty(listing) && section[listing].getListing instanceof Function) {
					var listing = section[listing].getListing();
					listing.section = sectionName;
					listing.id = this.allListings.length;

					if (!listing.hidden) {
						this.allListings.push(listing);
					}
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

		buyEquipment(player, data) {
			if (Equipment.hasOwnProperty(data.className)) {
				var slot = player.nextEquipmentSlot;

				if (slot != null) {
					var equipmentType = Equipment[data.className];
					var listing = equipmentType.getListing();

					if (player.credits >= listing.price) {
						player.credits -= listing.price;

						player.equipment[slot] = new equipmentType(player);
						player.equipmentListings[slot] = listing;
						player.shouldNetworkEquipmentListings = true;
					}
				}
			}
		}
	}

	return new Shop();
}