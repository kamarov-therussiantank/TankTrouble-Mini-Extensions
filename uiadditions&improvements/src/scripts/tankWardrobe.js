// Tank wardrobe
var TankTrouble = TankTrouble || {};
TankTrouble.GarageOverlay = {
    garageWrapper: null,
    garagePhaser: null,
    garageForm: null,
    garageSaveInput: null,
    garageWardrobe: null,
    garageSubmitInput: null,
    garageSaveInput: null,
    initialized: false,
    showing: false,
    playerId: null,
    phaserInstance: null,
    eventListeners: [],
    EVENTS: {
        OPENED: "opened",
        CLOSED: "closed"
    },
    _initialize: function() {
        this.garageWrapper = $("<div class='garage centre'/>");
        this.garagePhaser = $("<div class='phaser'></div>");
        this.garageForm = $("<form></form>");
        this.garageSubmitsContainer = $("<div></div>");
        this.garageSubmitInput = $("<button class='medium' type='submit'>Done</button>");
        this.garageSaveInput = $("<button id='saveButton' class='medium' type='button'>Save</button>");
        this.garageWardrobe = $("<div id='wardrobe'></div>");
        Utils.addOverlayFormRow(this.garageForm, this.garageWardrobe);
        Utils.addOverlayFormRow(this.garageForm, this.garageSubmitsContainer);
        this.garageSubmitsContainer.append(this.garageSaveInput);
        this.garageSubmitsContainer.append(this.garageSubmitInput);
        this.garageWrapper.append(this.garagePhaser);
        this.garageWrapper.append(this.garageForm);
        this.garageSaveInput.click(() => {
            this.saveCurrentLoadout();
        });
        this.garageForm.submit(function(event) {
            OverlayManager.popOverlay(true, false);
            return false;
        });
        this.initialized = true;
    },
    show: function(params) {
        if (!this.initialized) this._initialize();
        this.playerId = params.playerId;
        this.garagePhaser.empty();
        if (this.phaserInstance == null) {
            var config = {
                width: this.garagePhaser.width(),
                height: $(window).height() * 0.9,
                renderer: Phaser.WEBGL,
                parent: this.garagePhaser[0],
                transparent: true
            };
            this.phaserInstance = new Phaser.Game(config);
            this.phaserInstance.state.add('Boot', Garage.UIBootState.create());
            this.phaserInstance.state.add('Preload', Garage.UIPreloadState.create());
            this.phaserInstance.state.add('Load', Garage.UILoadState.create(this.playerId));
            this.phaserInstance.state.add('Main', Garage.UIMainState.create(this.playerId));
            this.phaserInstance.state.start('Boot');
        }
        this.renderWardrobe();
        this.showing = true;
        this._notifyEventListeners(this.EVENTS.OPENED, this.playerId);
    },
    saveCurrentLoadout: function() {
        const playerId = this.playerId;
        Backend.getInstance().getPlayerDetails((result) => {
            if (typeof result !== "object") return;
            const save = {
                turretColour: result.getTurretColour(),
                baseColour: result.getBaseColour(),
                treadColour: result.getTreadColour(),
                turretAccessory: result.getTurretAccessory(),
                barrelAccessory: result.getBarrelAccessory(),
                frontAccessory: result.getFrontAccessory(),
                backAccessory: result.getBackAccessory(),
                treadAccessory: null,
                backgroundAccessory: null,
                badge: null
            };
        let saves = JSON.parse(localStorage.getItem("wardrobe") || "[]");
        const saveId = Date.now() + "_" + Math.floor(Math.random() * 1000);
        saves.push({
            id: saveId,
            playerId: playerId,
            data: save
        });
        localStorage.setItem("wardrobe", JSON.stringify(saves));
        this.renderWardrobe();
        }, function(){}, function(){}, playerId, Caches.getPlayerDetailsCache());
    },
    createPreviewCanvas: function(save) {
        const canvas = document.createElement("canvas");
        canvas.width = UIConstants.TANK_ICON_WIDTH_MEDIUM;;
        canvas.height = UIConstants.TANK_ICON_HEIGHT_MEDIUM;
        UITankIcon.loadTankIcon(
            canvas,
            UIConstants.TANK_ICON_SIZES.MEDIUM,
            save.turretColour,
            save.treadColour,
            save.baseColour,
            save.turretAccessory,
            save.barrelAccessory,
            save.frontAccessory,
            save.backAccessory,
            save.treadAccessory,
            save.backgroundAccessory,
            save.badge,
            function() {},
            this
        );
        return canvas;
    },
    renderWardrobe: function() {
        const wrapper = this.garageWardrobe;
        wrapper.empty();
        let saves = JSON.parse(localStorage.getItem("wardrobe") || "[]");
        saves = saves.filter(s => s.playerId === this.playerId);
        if (saves.length === 0) {
            wrapper.append("<p id='no-saved-tanks'>No saves</p>");
            return;
        }
        saves.forEach(save => {
            const canvas = this.createPreviewCanvas(save.data);
            const item = $("<div class='wardrobe-item'></div>");
            const buttonsDiv = $("<div id='wardrobe-buttons'></div>");
            const equipBtn = $("<button id='equip-btn' class='medium' type='button'>Equip</button>");
            const deleteBtn = $("<button id='delete-btn' class='medium' type='button'>×</button>");
            equipBtn.click(() => this.loadLoadout(save.id));
            deleteBtn.click(() => this.deleteLoadout(save.id));
            item.append(canvas);
            buttonsDiv.append(equipBtn);
            buttonsDiv.append(deleteBtn);
            item.append(buttonsDiv);
            wrapper.append(item);
        });
    },
    loadLoadout: function(id) {
    let saves = JSON.parse(localStorage.getItem("wardrobe") || "[]");
    const save = saves.find(s => s.id === id);
    if (!save) return;
    const state = this.phaserInstance.state.getCurrentState();
    const tankIcon = state.selectedTankIcon;
    if (!tankIcon) return;
    const playerId = this.playerId;
    Backend.getInstance().getPlayerDetails(async (current) => {
        if (typeof current !== "object") return;
        const applyColour = (part, color, currentColor) => new Promise(resolve => {
            if (currentColor && ((color.type === 'image' && color.rawValue === currentColor.rawValue) ||
                                 (color.type !== 'image' && color.numericValue === currentColor.numericValue))) {
                resolve();
                return;
            }
            Backend.getInstance().setColour(
                () => { 
                    if (tankIcon.updateColour) tankIcon.updateColour(part, color.rawValue); 
                    resolve();
                },
                () => resolve(),
                () => resolve(),
                playerId,
                part,
                color.type === 'image' ? color.rawValue : color.numericValue,
                Caches.getPlayerDetailsCache()
            );
        });
        const applyAccessory = (part, value, currentValue) => new Promise(resolve => {
        const currentNum = currentValue != null ? currentValue : 0;
        const valueNum = value != null ? value : 0;
        if (currentNum === valueNum) {
            resolve();
            return;
        }
            Backend.getInstance().setAccessory(
                () => {
                    Users.updateUser(playerId, true, false);
                    if (state.accessorySprites[part + valueNum]) state._setAccessorySelection(state.accessorySprites[part + valueNum]);
                    resolve();
                },
                () => resolve(),
                () => resolve(),
                playerId,
                part,
                valueNum,
                Caches.getPlayerDetailsCache()
            );
        });
        const currentColours = {
            turret: current.getTurretColour(),
            base: current.getBaseColour(),
            tread: current.getTreadColour()
        };
        const currentAccessories = {
            turret: current.getTurretAccessory(),
            barrel: current.getBarrelAccessory(),
            front: current.getFrontAccessory(),
            back: current.getBackAccessory(),
            tread: current.getTreadAccessory(),
            background: current.getBackgroundAccessory(),
            badge: current.getBadge()
        };
        const ongoingTasks = [
            ...Object.entries(currentColours).map(([p, c]) => applyColour(p, c)),
            ...Object.entries(currentAccessories).map(([p, v]) => applyAccessory(p, v))
        ];
        await Promise.all(ongoingTasks);
        const savedColours = {
            turret: save.data.turretColour,
            base: save.data.baseColour,
            tread: save.data.treadColour
        };
        const savedAccessories = {
            turret: save.data.turretAccessory,
            barrel: save.data.barrelAccessory,
            front: save.data.frontAccessory,
            back: save.data.backAccessory,
            tread: save.data.treadAccessory,
            background: save.data.backgroundAccessory,
            badge: save.data.badge
        };
        const doneTasks = [
            ...Object.entries(savedColours).map(([part, color]) => color ? applyColour(part, color, currentColours[part]) : null).filter(Boolean),
            ...Object.entries(savedAccessories).map(([part, value]) => (value != null) ? applyAccessory(part, value, currentAccessories[part]) : null).filter(Boolean)
        ];
        await Promise.all(doneTasks);
        }, function(){}, function(){}, playerId, Caches.getPlayerDetailsCache());
    },
    deleteLoadout: function(id) {
        let saves = JSON.parse(localStorage.getItem("wardrobe") || "[]");
        saves = saves.filter(s => s.id !== id);
        localStorage.setItem("wardrobe", JSON.stringify(saves));
        this.renderWardrobe();
    },
    hide: function() {
        if (!this.initialized) this._initialize();
        var self = this;
        setTimeout(function() {
            self.phaserInstance.destroy();
            self.phaserInstance = null;
        }, 200);
        this.showing = false;
        this._notifyEventListeners(this.EVENTS.CLOSED, this.playerId);
    },
    addEventListener: function(callback, context) {
        this.eventListeners.push({ cb: callback, ctxt: context });
    },
    removeEventListener: function(callback, context) {
        this.eventListeners = this.eventListeners.filter(
            l => l.cb !== callback || l.ctxt !== context
        );
    },
    _notifyEventListeners: function(evt, data) {
        this.eventListeners.forEach(l => l.cb(l.ctxt, evt, data));
    },
    getContents: function() {
        if (!this.initialized) {
            this._initialize();
        }
        return this.garageWrapper;
    },
    shouldHide: function() {
        return true;
    },
    canBeCancelled: function() {
        return true;
    },
};