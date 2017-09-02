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

		buyItem(player, id) {
			var listing = this.allListings[id];

			if (player.credits >= listing.price) {

			}

			return false;
		}
	}

	return new Shop(Weapon);
}