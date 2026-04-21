UIConstants.GAME_ICON_COUNT = 6;
UIConstants.GAME_ICON_POOL_SIZE = 6
UIConstants.GAME_ICON_WIDTH /= 1.3;
UIConstants.GAME_ICON_HEIGHT /= 1.3;

function createCircle(count, radiusX, radiusY) {
    const positions = [];
    if (count <= 0) return positions;
    const angleStep = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
        const angle = i * angleStep - Math.PI / 4;
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        const flipped = x > 0;
        positions.push({ x, y, flipped });
    }
    return positions;
}

UIGameIconImage.prototype.spawn = function(x, y, gameState, favouriteActiveQueuedCounts) {
	this.reset(x, y);
    this.gameId = gameState.getId();
    this.mode = gameState.getMode();
    this.ranked = gameState.getRanked();
    this.symmetric = gameState.getSymmetric();
    this.premium = gameState.getPremium();
	this.playerStates = gameState.getPlayerStates().slice(0, 6).sort((a, b) => a.getPlayerId() - b.getPlayerId());
    this.favouriteActiveQueuedCounts = favouriteActiveQueuedCounts;
    const count = Math.min(this.playerStates.length, 6);
    let radiusX = 90;
    let radiusY = 60;
    if (count <= 3) {
        radiusX = 70;
        radiusY = 50;
    } else if (count >= 6) {
        radiusX = 100;
        radiusY = 70;
    }
    this.iconPlacements = createCircle(count, radiusX, radiusY);
    this._updateUI();
    const delay = 50 + Math.random() * 200;
    if (this.removeTween) this.removeTween.stop();
    this.game.add.tween(this.scale).to(
        {
            x: UIConstants.ASSET_SCALE / 1.3,
            y: UIConstants.ASSET_SCALE / 1.3
        },
        UIConstants.ELEMENT_POP_IN_TIME,
        Phaser.Easing.Back.Out,
        true,
        delay
    );
};

UIGameIconImage.prototype.refresh = function(gameState, favouriteActiveQueuedCounts) {
    this.mode = gameState.getMode();
    this.ranked = gameState.getRanked();
    this.symmetric = gameState.getSymmetric();
    this.premium = gameState.getPremium();
    this.playerStates = gameState.getPlayerStates().slice(0, 6).sort((a, b) => a.getPlayerId() - b.getPlayerId());
    this.favouriteActiveQueuedCounts = favouriteActiveQueuedCounts;
    const count = Math.min(this.playerStates.length, 6);
    let radiusX = 90;
    let radiusY = 60;
    if (count <= 3) {
        radiusX = 70;
        radiusY = 50;
    } else if (count >= 6) {
        radiusX = 100;
        radiusY = 70;
    }
    this.iconPlacements = createCircle(count, radiusX, radiusY);
    this._updateUI();
};

UIGameIconImage.prototype._updateUI = function() {
    this.frame = (this.symmetric ? 1 : 0) * 2 + (this.premium ? 1 : 0);
    var iconFrame = UIConstants.GAME_MODE_NAME_INFO[this.mode]?.ICON ?? -1;
    if (iconFrame < 0) {
        this.gameModeIcon.visible = false;
    } else {
        this.gameModeIcon.frame = iconFrame * 2 + (this.premium ? 1 : 0);
        this.gameModeIcon.visible = true;
    }
    for (var playerId in this.tankIcons) {
        if (!this.playerStates.some(ps => ps.getPlayerId() === playerId)) {
            this.tankIcons[playerId].icon.remove();
            this.tankIcons[playerId].name.remove();
            delete this.tankIcons[playerId];
        }
    }
    var count = Math.min(this.playerStates.length, 6);
    for (var i = 0; i < count; i++) {
        var ps = this.playerStates[i];
        var playerId = ps.getPlayerId();
        var placement = this.iconPlacements[i];
        if (!this.tankIcons[playerId]) {
            var icon = new UITankIconImage(this.game, true, UIConstants.TANK_ICON_SIZES.SMALL);
            var name = new UITankIconNameGroup(this.game, UIConstants.TANK_ICON_WIDTH_SMALL, true);
            this.tankIconGroup.add(icon);
            this.tankNameGroup.add(name);
            icon.spawn(placement.x, placement.y - 20, playerId, placement.flipped, true);
            name.spawn(placement.x, placement.y + 20, playerId, undefined, this.ranked);
            this.tankIcons[playerId] = { icon, name };
        } else {
            var t = this.tankIcons[playerId];
            t.icon.refresh();
            t.icon.x = placement.x;
            t.icon.y = placement.y - 20;
            t.icon.scale.x = placement.flipped ? -Math.abs(t.icon.scale.x) : Math.abs(t.icon.scale.x);
            t.name.refresh(undefined, undefined, undefined, this.ranked);
            t.name.x = placement.x;
            t.name.y = placement.y + 20;
        }
    }
};

UIGameIconImage.prototype.remove = function() {
    this.removeTween = this.game.add.tween(this.scale).to({
        x: 0,
        y: 0
    }, UIConstants.ELEMENT_GLIDE_OUT_TIME, Phaser.Easing.Linear.None, true);
    this.removeTween.onComplete.add(() => this.kill());
    this.tankIconGroup.callAll('remove');
    this.tankNameGroup.callAll('remove');
    this.tankIcons = {};
};

UIGameIconImage.prototype.retire = function() {
    this.kill();
    this.tankIconGroup.callAll('retire');
    this.tankNameGroup.callAll('retire');
};