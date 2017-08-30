module.exports = function() {
	const capacity = (process.env.QUADTREE_CAPACITY || 4);
	const maxLevel = (process.env.QUADTREE_MAXLEVEL || 6);

	class QuadTree {
		constructor(x, y, size, level) {
			this.x = x;
			this.y = y;
			this.size = size;
			this.level = level;
			this.horizontalMidpoint = x + size / 2;
			this.verticalMidpoint = y + size / 2;
			this.objects = [];
			this.nodes = null;
		}

		insert(physicsObject) {
			if (this.nodes != null) {
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
					var index = this.getIndex(this.objects[i].info.bounds);

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
			var top = bounds.minY < this.verticalMidpoint && bounds.maxY < this.verticalMidpoint;
			var bottom = bounds.minY > this.verticalMidpoint;
			var left = bounds.minX < this.horizontalMidpoint && bounds.maxX < this.horizontalMidpoint;
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
			var halfSize = this.size / 2;

			this.nodes = [
				new QuadTree(this.x, this.y, halfSize, this.level + 1),						// Top left
				new QuadTree(this.x + halfSize, this.y, halfSize, this.level + 1),			// Top right
				new QuadTree(this.x, this.y + halfSize, halfSize, this.level + 1),			// Bottom left
				new QuadTree(this.x + halfSize, this.y + halfSize, halfSize, this.level + 1)	// Bottom right
			];
		}

		retrieve(bounds) {
			var retrievedObjects = this.objects;
			var index = this.getIndex(bounds);

			if (this.nodes != null) {
				if (index != -1) {
					retrievedObjects = retrievedObjects.concat(this.nodes[index].retrieve(bounds));
				} else {
					for (var i = 0; i < this.nodes.length; i++) {
						retrievedObjects = retrievedObjects.concat(this.nodes[i].retrieve(bounds));
					}
				}
			}

			return retrievedObjects;
		}

		clear() {
			this.objects.length = 0;

			if (this.nodes != null) {
				for (var i = 0; i < this.nodes.length; i++) {
					this.nodes[i].clear();
				}
			}

			this.nodes = null;
		}

		getDebugInfo(debugInfo) {
			debugInfo = debugInfo || [];

			if (this.nodes != null) {
				for (var i = this.nodes.length - 1; i >= 0; i--) {
					this.nodes[i].getDebugInfo(debugInfo);
				}
			}

			debugInfo.push({
				x: this.x,
				y: this.y,
				size: this.size
			});

			return debugInfo;
		}
	}

	return QuadTree;
}