// Player Lookup
whenContentInitialized().then(() => {
    const tankCache = new Map();
    function createTankCanvas(details) {
        const key = JSON.stringify({
            turretColour: details.turretColour,
            baseColour: details.baseColour,
            treadColour: details.treadColour,
            turretAccessory: details.turretAccessory,
            barrelAccessory: details.barrelAccessory,
            frontAccessory: details.frontAccessory,
            backAccessory: details.backAccessory,
            treadAccessory: details.treadAccessory,
            backgroundAccessory: details.backgroundAccessory,
            badge: details.badge
        });
        if (tankCache.has(key)) return tankCache.get(key);
        const canvas = document.createElement("canvas");
        canvas.width = UIConstants.TANK_ICON_WIDTH_LARGE;
        canvas.height = UIConstants.TANK_ICON_HEIGHT_LARGE;
        UITankIcon.loadTankIcon(
            canvas,
            UIConstants.TANK_ICON_SIZES.LARGE,
            details.turretColour,
            details.treadColour,
            details.baseColour,
            details.turretAccessory,
            details.barrelAccessory,
            details.frontAccessory,
            details.backAccessory,
            details.treadAccessory || null,
            details.backgroundAccessory || null,
            details.badge,
            function () {},
            this
        );
        tankCache.set(key, canvas);
        return canvas;
    }
    TankTrouble.PlayerLookupOverlay = {
        wrapper: null,
        content: null,
        initialized: false,
        showing: false,
        playerId: null,
        _initialize() {
            this.wrapper = $('<div class="playerLookupOverlay centre"></div>');
            this.content = $('<div class="content"></div>');
            this.wrapper.append(this.content);
            this.initialized = true;
        },
        renderPlayer(playerId) {
            this.content.empty();
            this.content.append('<div></div>');
            Backend.getInstance().getPlayerDetails(
                result => {
                    if (typeof result !== 'object') {
                        this.content.html('<div>Failed to load player details</div>');
                        return;
                    }
                    const rank = result.getRank ? result.getRank() : 0;
                    const xp = result.getXP ? result.getXP() : 0;
                    const exp = result.getExperience ? result.getExperience() : 0;
                    const playerData = {
                        playerId: result.getPlayerId ? result.getPlayerId() : playerId,
                        username: result.getUsername(),
                        rank, rankTitle: UIConstants.RANK_TITLES[UIUtils.getRankLevelFromRank(rank)],
                        rankNext: UIConstants.RANK_LEVELS[UIUtils.getRankLevelFromRank(rank)],
                        xp, level: UIUtils.getLevelFromXp(xp) + 1, xpNext: UIConstants.XP_LEVELS[UIUtils.getLevelFromXp(xp)],
                        exp: result.getExperience ? result.getExperience() : 0,
                        kills: result.getKills ? result.getKills() : 0,
                        victories: result.getVictories ? result.getVictories() : 0,
                        deaths: result.getDeaths ? result.getDeaths() : 0,
                        suicides: result.getSuicides ? result.getSuicides() : 0,
                        defeats: result.getDeaths && result.getSuicides ? result.getDeaths() - result.getSuicides() : 0,
                        gmLevel: result.getGmLevel ? result.getGmLevel() : null,
                        creationDate: result.getCreated ? new Date(result.getCreated() * 1000) : null,
                        country: result.getCountry ? result.getCountry() : null,
                        verified: result.getVerified ? result.getVerified() : false,
                        lastLogin: result.getLastLogin ? result.getLastLogin() : null,
                        premium: result.getPremium ? result.getPremium() : false,
                        beta: result.getBeta ? result.getBeta() : false,
                        classic: result.getExperience ? result.getExperience () : 0,
                        addonsTeamMember: ["kamarov", "commander"].includes(result.getUsername()),
                        rawData: result.data || {},
                        turretColour: result.getTurretColour(),
                        baseColour: result.getBaseColour(),
                        treadColour: result.getTreadColour(),
                        turretAccessory: result.getTurretAccessory(),
                        barrelAccessory: result.getBarrelAccessory(),
                        frontAccessory: result.getFrontAccessory(),
                        backAccessory: result.getBackAccessory(),
                        treadAccessory: result.getTreadAccessory(),
                        backgroundAccessory: result.getBackgroundAccessory(),
                    };
                    const rankPercent = playerData.rankNext ? Math.min((playerData.rank / playerData.rankNext) * 100, 100) : 100;
                    const xpPercent = playerData.xpNext ? Math.min((playerData.xp / playerData.xpNext) * 100, 100) : 100;
                    this.content.empty();
                    const tankWrapper = $('<div class="playerLookup-tank"></div>');
                    const canvas = createTankCanvas(playerData);
                    tankWrapper.append(canvas);
                    const info = $('<div class="playerLookup-info"></div>');
                    const detailsLeft = $('<div class="player-details-left"></div>');
                    const detailsRight = $(`<div class="player-details-right"></div>`);
                    const username = $(`
                        <div id="playerLookup-username">
                            ${playerData.username}
                        </div>
                    `);
                    const playerId = $(`
                        <div id="playerLookup-playerId">
                            #${playerData.playerId}
                        </div>
                    `);
                    const badges = $('<div class="playerLookup-badges"></div>');
                    if (playerData.classic > 0) {
                        badges.append(`
                            <img class="lookupBadge" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/classicBadge.png"/>
                        `);
                    }
                    if (playerData.beta) {
                        badges.append(`
                            <img class="lookupBadge" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/betaBadge.png"/>
                        `);
                    }
                    if (playerData.premium) {
                        badges.append(`
                            <img class="lookupBadge" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/premiumBadge.png"/>
                        `);
                    }
                    if (playerData.addonsTeamMember) {
                        badges.append(`
                            <img class="lookupBadge" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/addonsBadge.png"/>
                        `);
                    }
                    Backend.getInstance().ajax.getBackers(backerResult => {
                        const backers = backerResult.result.data;
                        if (backers.includes(playerData.username)) {
                            badges.append(`
                                <img class="lookupBadge" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/backerBadge.png"/>
                            `);
                        }
                    });
                    const rankBar = $(`
                    <div class="lookup-progress">
                        <div class="lookup-progress-label">${playerData.rankTitle} (${playerData.rank.toLocaleString()} ${playerData.rankNext ? '/' + playerData.rankNext.toLocaleString() : ''})</div>
                        <div class="lookup-progress-bg rank">
                            <div class="lookup-progress-fill rank" style="width:${rankPercent}%"></div>
                        </div>
                    </div>
                    `);
                    const xpBar = $(`
                    <div class="lookup-progress">
                        <div class="lookup-progress-label"> Level ${playerData.level} (${playerData.xp.toLocaleString()} XP)</div>
                        <div class="lookup-progress-bg xp">
                            <div class="lookup-progress-fill xp" style="width:${xpPercent}%"></div>
                        </div>
                    </div>
                    `);
                    const expBar = $(`
                    <div class="lookup-progress">
                        <div class="lookup-progress-label">${playerData.exp}</div>
                        <div class="lookup-progress-bg exp">
                            <div class="lookup-progress-fill exp"></div>
                        </div>
                    </div>
                    `);
                    const stats = $(`
                    <table class="player-stats">
                        <tr>
                            <td>Kills:</td>
                            <td>${playerData.kills.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Victories:</td>
                            <td>${playerData.victories.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Deaths:</td>
                            <td>${playerData.deaths.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Defeats:</td>
                            <td>${playerData.defeats.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td>Suicides:</td>
                            <td>${playerData.suicides.toLocaleString()}</td>
                        </tr>
                        ${
                            playerData.gmLevel !== null ? 
                            `<tr>
                                <td>GM Level:</td>
                                <td>${playerData.gmLevel}</td>
                            </tr>`
                            : ''
                        }
                        <tr>
                            <td>Created:</td>
                            <td>${ playerData.creationDate ? playerData.creationDate.toLocaleDateString() : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Country:</td>
                            <td>${ playerData.country ? playerData.country : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Verified:</td>
                            <td>${ playerData.verified ? 'Yes' : 'No' }</td>
                        </tr>
                        <tr>
                            <td>Last Login:</td>
                            <td>${playerData.lastLogin ? new Date(playerData.lastLogin * 1000).toLocaleString() : 'N/A'}</td>
                        </tr>
                    </table>
                    `);
                    detailsRight.append(tankWrapper);
                    detailsRight.append(username);
                    detailsRight.append(playerId);
                    detailsRight.append(badges);
                    detailsLeft.append(rankBar);
                    if (playerData.exp > 0) {
                        detailsLeft.append(expBar);
                    }
                    detailsLeft.append(xpBar);
                    detailsLeft.append(stats);
                    info.append(detailsLeft);
                    info.append(detailsRight);
                    this.content.empty();
                    this.content.append(info);
                },
                () => {
                    this.content.html('<div>Failed to load player data</div>');
                },
                () => {},
                playerId,
                Caches.getPlayerDetailsCache()
            );
        },
        show(params) {
            if (!this.initialized) {
                this._initialize();
            }
            this.showing = true;
            this.playerId = params.playerId;
            this.renderPlayer(this.playerId);
        },
        hide() {
            this.showing = false;
            this.content.empty();
        },
        getContents() {
            if (!this.initialized)
                this._initialize();
            return this.wrapper;
        },
        shouldHide() {
            return true;
        },
        canBeCancelled() {
            return true;
        }
    };
    Loader.interceptFunction(TankTrouble.TankInfoBox, '_initialize', (original, ...args) => {
        original(...args);
        TankTrouble.TankInfoBox._updateFavouriteStatus = function() {};
        if (!TankTrouble.TankInfoBox.infoPlayerLookup) {
            TankTrouble.TankInfoBox.infoPlayerLookup = $('<div class="button"></div>');
            TankTrouble.TankInfoBox.infoPlayerLookup.append(`
                <img class="standard"
                    src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/playerLookup.png"
                    srcset="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/playerLookup%402x.png 2x">
            `);
            TankTrouble.TankInfoBox.infoPlayerLookup.append(`
                <img class="active"
                    src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/playerLookupActive.png"
                    srcset="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/playerLookupActive%402x.png 2x">
            `);
            TankTrouble.TankInfoBox.infoPlayerLookup.append(`
                <img class="disabled"
                    src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/playerLookupDisabled.png"
                    srcset="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/tankInfo/playerLookupDisabled%402x.png 2x">
            `);
            TankTrouble.TankInfoBox.infoPlayerLookup.on('mouseon', function() {
                if (!$(this).hasClass('disabled')) {
                    $(this).addClass('active');
                }
            });
            TankTrouble.TankInfoBox.infoPlayerLookup.on('mouseup', () => {
                OverlayManager.pushOverlay(TankTrouble.PlayerLookupOverlay, {playerId: TankTrouble.TankInfoBox.playerId});
                TankTrouble.TankInfoBox.hide();
            });
        }
        TankTrouble.TankInfoBox.infoPlayerLookup.insertBefore(TankTrouble.TankInfoBox.infoGameJoin);
        TankTrouble.TankInfoBox.infoPlayerLookup.tooltipster({position: 'top', offsetX: 5});
    });
    Loader.interceptFunction(TankTrouble.TankInfoBox, 'show', (original, ...args) => {
        original(...args);
        const [,, playerId] = args;
        TankTrouble.TankInfoBox.playerId = playerId;
        if (TankTrouble.TankInfoBox.username) {
            TankTrouble.TankInfoBox.infoPlayerLookup.tooltipster('content', 'Look up ' + TankTrouble.TankInfoBox.username);
        }
        const otherButtons = [
            TankTrouble.TankInfoBox.infoGameJoin,
        ];
        const hasVisible = otherButtons.some(btn => btn && btn.is(':visible'));
        TankTrouble.TankInfoBox.infoPlayerLookup.toggle(hasVisible);
    });

});