class ParticleManager {
	constructor() {
		this.emitters = [];
		this.nextId = 0;
		this.lastUpdateTime = Date.now();
	}

	addEmitter(emitter) {
		emitter.id = this.nextId;
		this.nextId++;

		this.emitters.push(emitter);
	}

	removeEmitter(emitter) {
		for (var i = this.emitters.length - 1; i >= 0; i--) {
			if (this.emitters[i].id == emitter.id) {
				this.emitters.splice(i, 1);
			}
		}
	}

	update() {
		var now = Date.now();

		for (var i = this.emitters.length - 1; i >= 0; i--) {
			this.emitters[i].update((now - this.lastUpdateTime) / (1000 / 60));
		}

		this.lastUpdateTime = now;
	}
}