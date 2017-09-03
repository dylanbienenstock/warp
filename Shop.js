/* Listing format:

{
	section: "ships" / "weapons" / "equipment",
	displayName: <string>,
	className: <string>,
	price: <number>
}

*/

module.exports = function(Weapon) {
	class Shop {
		constructor() {
			this.allListings = [];

			for (var weapon in Weapon) {
				if (Weapon.hasOwnProperty(weapon) && Weapon[weapon].getListing instanceof Function) {
					var listing = Weapon[weapon].getListing();
					listing.section = "weapons";
					listing.id = this.allListings.length;

					this.allListings.push(listing);
				}
			}
		}

		getAllListings() {
			return this.allListings;
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
						player.primaryWeapon = new weaponType(player);
					} else {
						player.secondaryWeapon = new weaponType(player);
					}
				}
			}
		}
	}

	return new Shop(Weapon);
}