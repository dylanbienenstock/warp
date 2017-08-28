module.exports = function() {
	const capacity = 8;
	const maxLevel = 8;

	return class QuadTree {
		constructor(x, y, size, level) {
			this.x = x;
			this.y = y;
			this.size = size;
			this.level = level;
			this.horizontalMidpoint = x + size / 2;
			this.verticalMidpoint = y + size / 2;
			this.objects = null;
			this.nodes = null;
		}

		insert(physicsObject) {
			if (nodes != null) {
				var index = this.getIndex(physicsObject.info.bounds);

				if (index != -1) {
					this.nodes[index].insert(physicsObject);

					return;
				}
			}

			this.objects.push(physicsObject);

			if (this.objects.length > capacity && this.level < maxLevel) {
				if (this.nodes == null) {
					this.subdivide();
				}

				var i = 0;
				while (i < this.objects.length) {
					var index = this.getIndex(this.objects[i]);

					if (index != -1) {
						this.nodes[index].insert(this.objects[i]);
						this.objects.splice(i, 1);
					}
					else {
						i++;
					}
				}
			}
		}

		getIndex(bounds) {
			var top = bounds.maxY > this.verticalMidpoint;
			var bottom = bounds.minY < this.verticalMidpoint;
			var left = bounds.maxX < this.horizontalMidpoint;
			var right = bounds.minX > this.horizontalMidpoint;

			if (top) {
				if (left) {
					return 0;
				} else if (right) {
					return 1;
				}
			} else if (bottom) {
				if (left) {
					return 2;
				} else if (right) {
					return 3;
				}
			}

			return -1;
		}

		subdivide() {
			var halfSize = size / 2;

			this.nodes = [
				new QuadTree(x, y, halfSize, this.level + 1),						// Top left
				new QuadTree(x + halfSize, y, halfSize, this.level + 1),			// Top right
				new QuadTree(x, y + halfSize, halfSize, this.level + 1),			// Bottom left
				new QuadTree(x + halfSize, y + halfSize, halfSize, this.level + 1),	// Bottom right
			];
		}

		retrieve(bounds, retrievedObjects) {
			retrievedObjects = retrievedObjects || [];

			var index = this.getIndex(bounds);

			if (index != -1 && this.nodes != null) {
				nodes[index].retrievedObjects(bounds, retrievedObjects);
			}

			for (var i = this.objects.length - 1; i >= 0; i--) {
				retrievedObjects.push(this.objects[i]);
			}

			return retrievedObjects;
		}

		clear() {
			this.objects.length = 0;

			for (var i = this.nodes.length - 1; i >= 0; i--) {
				if (this.nodes[i] != null) {
					this.nodes[i].clear();
					this.nodes[i] = null;
				}
			}
		}
	}
}