window.Loader = class {
    static interceptFunction(context, funcName, handler, attributes = {}) {
        const original = Reflect.get(context, funcName);
        if (typeof original !== 'function') {
            throw new Error(`Item ${funcName} is not typeof function`);
        }

        Reflect.defineProperty(context, funcName, {
            value: (...args) => handler(original.bind(context), ...args),
            ...attributes
        });
    }
};

window.whenContentInitialized = function() {
    return new Promise(resolve => {
        const check = () => {
            const container = document.readyState === 'complete';
            if (container && typeof TankTrouble !== "undefined") {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
};

//Disable camera shake
UIConstants.MAX_CAMERA_SHAKE = 0;
UIConstants.CAMERA_SHAKE_FADE = 0;
UIConstants.MINE_EXPLOSION_CAMERA_SHAKE = 0;
 
//Disable feather particles spawning
UIConstants.TANK_FEATHER_COUNT = 0;
UIConstants.TANK_FEATHER_POOL_SIZE = 0;
 
//Disable score fragments particles spawning
UIConstants.MAX_SCORE_FRAGMENTS_PER_EXPLOSION = 0;
UIConstants.MIN_SCORE_FRAGMENTS_PER_LETTER = 0;
 
//Lower the sparkle effects
UIConstants.GOLD_SPARKLE_MAX_INTERVAL_TIME = 9999
UIConstants.GOLD_SPARKLE_MIN_INTERVAL_TIME = 9999
UIConstants.DIAMOND_SPARKLE_MAX_INTERVAL_TIME = 9999
UIConstants.DIAMOND_SPARKLE_MIN_INTERVAL_TIME = 9999
 
//Lower and disable garage animations
UIConstants.GARAGE_WELD_PARTICLE_TIME = 500
UIConstants.GARAGE_WELD_SMOKE_TIME = 500
UIConstants.GARAGE_WELD_SPARK_TIME = 500
UIConstants.GARAGE_SPRAY_SHAKE_PROBABILITY = 0
UIConstants.GARAGE_SPRAY_PARTICLE_TIME = 550
 
//Disable rubble particles
UIConstants.RUBBLE_TREAD_OFFSET = 0
UIConstants.RUBBLE_FRAGMENT_POOL_SIZE = 0
UIConstants.RUBBLE_FRAGMENT_MAX_LIFETIME= 0
UIConstants.RUBBLE_FRAGMENT_MIN_LIFETIME= 0
UIConstants.RUBBLE_FRAGMENT_MAX_ROTATION_SPEED= 0
UIConstants.RUBBLE_FRAGMENT_SPEED_SCALE = 0
UIConstants.RUBBLE_FRAGMENT_RANDOM_SPEED = 0
UIConstants.RUBBLE_SMOKE_SPEED_SCALE = 0
UIConstants.RUBBLE_SMOKE_RANDOM_SPEED = 0
UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_COLLISION = 9999
UIConstants.INVERSE_RUBBLE_SPAWN_PROBABILITY_IN_THE_OPEN = 9999
 
//Lower and disable shield animations
UIConstants.SHIELD_LAYER_1_ROTATION_SPEED = 0
UIConstants.SHIELD_LAYER_2_ROTATION_SPEED = 0
UIConstants.SHIELD_NUM_BOLTS = 0
UIConstants.SHIELD_SPARK_BOLT_POOL_SIZE = 0
 
//Disable poof effects weapons
UIConstants.BULLET_PUFF_POOL_SIZE = 0
 
//Lower the amount of particles spawning for each quality
QualityManager.QUALITY_VALUES.auto = {
    "tank explosion smoke count": 2,
    "tank explosion fragment count": 2,
    "missile launch smoke count": 0,
    "missile smoke frequency": 9999,
    "mine explosion smoke count": 2,
    "crate land dust count": 0,
    "aimer min segment length":2,
    "aimer off max segment length": 15.0,
    "aimer on max segment length": 6.0,
    "bullet puff count": 0,
    "shield inverse bolt probability": 1,
    "shield spark particles per emit": 0,
    "spawn zone inverse unstable particle probability": 1,
    "spawn zone num collapse particles": 0
};
 
QualityManager.QUALITY_VALUES.high = {
    "tank explosion smoke count": 2,
    "tank explosion fragment count": 2,
    "missile launch smoke count": 0,
    "missile smoke frequency": 9999,
    "mine explosion smoke count": 2,
    "crate land dust count": 0,
    "aimer min segment length": 2,
    "aimer off max segment length": 10.0,
    "aimer on max segment length": 5.0,
    "bullet puff count": 0,
    "shield inverse bolt probability": 1,
    "shield spark particles per emit": 0,
    "spawn zone inverse unstable particle probability": 1,
    "spawn zone num collapse particles": 0
};
 
QualityManager.QUALITY_VALUES.low = {
    "tank explosion smoke count": 1,
    "tank explosion fragment count": 1,
    "missile launch smoke count": 0,
    "missile smoke frequency": 9999,
    "mine explosion smoke count": 1,
    "crate land dust count": 0,
    "aimer min segment length": 0,
    "aimer off max segment length": 12.0,
    "aimer on max segment length": 6.0,
    "bullet puff count": 0,
    "shield inverse bolt probability": 1,
    "shield spark particles per emit": 0,
    "spawn zone inverse unstable particle probability": 1,
    "spawn zone num collapse particles": 0
};

(function () {
    const TARGET_FPS = 240;
    function getFrameDeltaMS(time) {
        const elapsedMS = Number(time.elapsedMS);
        if (Number.isFinite(elapsedMS) && elapsedMS > 0) return elapsedMS;
        const delta = Number(time.delta);
        if (Number.isFinite(delta) && delta > 0) return delta;
        return 1000 / 60;
    }
    function applyFPSpatch() {
        if (!window.Phaser || !Phaser.Time || !Phaser.Game) {
            requestAnimationFrame(applyFPSpatch);
            return;
        }
        if (Phaser.Time.prototype.__fpsUnlocked) return;
        Phaser.Time.prototype.__fpsUnlocked = true;
        Object.defineProperty(Phaser.Time.prototype, 'physicsElapsed', {
            get: function () {
                return getFrameDeltaMS(this) / 1000;
            },
            set: function (value) {
                const ms = Number(value) * 1000;
                if (Number.isFinite(ms)) {
                    this.elapsedMS = ms;
                    this.delta = ms;
                }
            },
            configurable: true
        });
        Object.defineProperty(Phaser.Time.prototype, 'physicsElapsedMS', {
            get: function () {
                return getFrameDeltaMS(this);
            },
            set: function (value) {
                const ms = Number(value);
                if (Number.isFinite(ms)) {
                    this.elapsedMS = ms;
                    this.delta = ms;
                }
            },
            configurable: true
        });
        if (!Phaser.Game.prototype.__fpsUnlockWrapped && typeof Phaser.Game.prototype.update === 'function') {
            const originalUpdate = Phaser.Game.prototype.update;
            Phaser.Game.prototype.__fpsUnlockWrapped = true;
            Phaser.Game.prototype.update = function (time) {
                if (this.time) {
                    const currentFps = Number(this.time.desiredFps);
                    const desiredFps = Number.isFinite(currentFps) ? Math.max(currentFps, TARGET_FPS) : TARGET_FPS;
                    this.time.desiredFps = desiredFps;
                    this.time.desiredFpsMult = 1 / desiredFps;
                    if (typeof this.forceSingleUpdate === 'boolean') {
                        this.forceSingleUpdate = true;
                    }
                }
                return originalUpdate.call(this, time);
            };
        }
    }
    applyFPSpatch();
})();
