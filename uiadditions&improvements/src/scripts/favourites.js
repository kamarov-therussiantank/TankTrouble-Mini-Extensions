// Favourites box
whenContentInitialized().then(() => {
    const KEY = "favourites";
    function getFavourites() {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    }
    const lastLoginTracker = new Map();
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
        canvas.width = UIConstants.TANK_ICON_WIDTH_SMALL;
        canvas.height = UIConstants.TANK_ICON_HEIGHT_SMALL;
        UITankIcon.loadTankIcon(
            canvas,
            UIConstants.TANK_ICON_SIZES.SMALL,
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
    function showNotification(message, player = null, duration = 3500) {
        let notif = document.getElementById("tt-notification");
        if (!notif) {
            notif = document.createElement("div");
            notif.id = "tt-notification";
            document.body.appendChild(notif);
            Object.assign(notif.style, {
                position: "fixed",
                height: "40px",
                top: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255, 255, 255)",
                border: "3px solid #d3d3d3",
                color: "#464646",
                padding: "10px 16px",
                borderRadius: "24px",
                fontSize: "14px",
                zIndex: 9999,
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                filter: "drop-shadow(rgba(0, 0, 0, 0.5) 0px 2px 3px)",
                display: "flex",
                alignItems: "center",
                gap: "10px"
            });
        }
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible" && notif._timeout) {
                notif.style.opacity = "0";
                notif.style.transform = "translateX(-50%) translateY(-10px)";
                clearTimeout(notif._timeout);
                notif._timeout = null;
            }
        });
        notif.innerHTML = "";
        if (player) {
            const canvas = createTankCanvas(player);
            canvas.style.width = UIConstants.TANK_ICON_WIDTH_SMALL;
            canvas.style.height = UIConstants.TANK_ICON_HEIGHT_SMALL;
            notif.appendChild(canvas);
        }
        const text = document.createElement("div");
        text.textContent = message;
        notif.appendChild(text);
        notif.style.opacity = "0";
        notif.style.transform = "translateX(-50%) translateY(-10px)";
        requestAnimationFrame(() => {
            notif.style.opacity = "1";
            notif.style.transform = "translateX(-50%) translateY(0)";
        });
        clearTimeout(notif._timeout);
        notif._timeout = setTimeout(() => {
            notif.style.opacity = "0";
            notif.style.transform = "translateX(-50%) translateY(-10px)";
        }, duration);
    }
    function checkFavouriteActivity() {
        const favourites = getFavourites();
        if (!favourites.length) return;
        const promises = favourites.map(playerId => {
            return new Promise(resolve => {
                Backend.getInstance().getPlayerDetails(
                    result => {
                        if (typeof result === 'object') {
                            resolve({
                                playerId,
                                username: result.getUsername(),
                                lastLogin: result.getLastLogin(),
                                turretColour: result.getTurretColour(),
                                baseColour: result.getBaseColour(),
                                treadColour: result.getTreadColour(),
                                turretAccessory: result.getTurretAccessory(),
                                barrelAccessory: result.getBarrelAccessory(),
                                frontAccessory: result.getFrontAccessory(),
                                backAccessory: result.getBackAccessory(),
                                treadAccessory: result.getTreadAccessory(),
                                backgroundAccessory: result.getBackgroundAccessory(),
                                badge: result.getBadge()
                            });
                        } else {
                            resolve(null);
                        }
                    },
                    () => resolve(null),
                    () => {},
                    playerId,
                    Caches.getPlayerDetailsCache()
                );
            });
        });
        Promise.all(promises).then(players => {
            players.forEach(player => {
                if (!player) return;
                const previousLogin = lastLoginTracker.get(player.playerId);
                if (
                    previousLogin !== undefined &&
                    player.lastLogin &&
                    player.lastLogin !== previousLogin
                ) {
                    showNotification(`${player.username} was seen in the mazes!`, player);
                }
                lastLoginTracker.set(player.playerId, player.lastLogin);
            });
        });
    }
    setInterval(checkFavouriteActivity, 1000);
    checkFavouriteActivity();
    const playersOverlay = {
        container: null,
        background: null,
        content: null,
        initialized: false,
        showing: false,
        playerId: null,
        _initialize() {
            this.container = $('<div class="box noselect" id="favourites-box"></div>');
            this.content = $('<div class="content"></div>');
            this.background = $('<div class="boxbackground"></div>');
            this.searchContainer = $('<div id="search-container"></div>');;
            this.searchInput = $('<input type="text" placeholder="Enter username or identifier..." class="fav-search">');
            this.container.append(this.searchContainer);
            this.searchContainer.append(this.searchInput);
            this.container.append(this.content);
            $('body').append(this.background);
            $('body').append(this.container);
            this.container.hide();
            this.background.hide();
            this.searchInput.css({
                width: "90%",
                margin: "5px",
                padding: "4px",
                borderRadius: "6px",
                border: "2px solid #ffffff00",
                fontSize: "14px"
            });
            let searchTimeout;
            this.searchInput.on("input", (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.toLowerCase();
                    this.renderList();
                }, 120);
            });
            this.background.on('click', () => {
                if (this.showing) this.hide();
            });
            this.initialized = true;
        },
        renderList() {
            this.content.empty();
            const favourites = getFavourites();
            if (!favourites.length) {
                this.content.append('<div>No favourite players</div>');
                return;
            }
            const promises = favourites.map(playerId => {
                return new Promise(resolve => {
                    Backend.getInstance().getPlayerDetails(
                        result => {
                            if (typeof result === 'object') {
                                resolve({
                                    playerId,
                                    username: result.getUsername(),
                                    lastLogin: result.getLastLogin() || 0,
                                    turretColour: result.getTurretColour(),
                                    baseColour: result.getBaseColour(),
                                    treadColour: result.getTreadColour(),
                                    turretAccessory: result.getTurretAccessory(),
                                    barrelAccessory: result.getBarrelAccessory(),
                                    frontAccessory: result.getFrontAccessory(),
                                    backAccessory: result.getBackAccessory(),
                                    treadAccessory: result.getTreadAccessory(),
                                    backgroundAccessory: result.getBackgroundAccessory(),
                                    badge: result.getBadge()
                                });
                            } else {
                                resolve({ playerId, username: `Player ${playerId}`, lastLogin: 0 });
                            }
                        },
                        () => resolve({ playerId, username: `Player ${playerId}`, lastLogin: 0 }),
                        () => {},
                        playerId,
                        Caches.getPlayerDetailsCache()
                    );
                });
            });
        Promise.all(promises).then(players => {
                players.sort((a, b) => b.lastLogin - a.lastLogin);
                if (this.searchQuery) {
                players = players.filter(player => {
                        const usernameMatch = player.username.toLowerCase().includes(this.searchQuery);
                        const idMatch = String(player.playerId).includes(this.searchQuery);
                        return usernameMatch || idMatch;
                    });
                }
                if (!players.length) {
                    this.content.append('<div>No matching players</div>');
                    return;
                }
                players.forEach(player => {
        const row = $('<div class="player-row"></div>');
        const canvas = createTankCanvas(player);
        const tankWrapper = $('<div class="player-tank"></div>');
        tankWrapper.append(canvas);
        const name = $(`<div class="player-name">${player.username}</div>`);
        const id = $(`<div class="player-id">#${player.playerId}</div>`);
        const login = $(`
            <div class="player-login">
                ${player.lastLogin 
                    ? `Last seen: ${new Date(player.lastLogin * 1000).toLocaleString()}`
                    : 'Never Logged in'}
            </div>
        `);
        const removeBtn = $('<div class="button remove-fav">Remove</div>');
                    removeBtn.on('click', () => {
                        const currentFavourites = getFavourites();
                        const updatedFavourites = currentFavourites.filter(id => id !== player.playerId);
                        localStorage.setItem(KEY, JSON.stringify(updatedFavourites));
                        this.renderList();
                    });
                    const info = $('<div class="player-info"></div>');
                    info.append(name);
                    info.append(id);
                    info.append(login);
                    info.append(removeBtn);
                    row.append(tankWrapper);
                    row.append(info);
                    this.content.append(row);
                });
            });
        },
        show(playerId, x, y) {
            if (!this.initialized) this._initialize();
            this.playerId = playerId;
            this.showing = true;
            this.renderList();
            this.container.show();
            this.background.fadeIn(200);
            this.container.css({
                left: x + 50,
                top: y - 230,
                position: 'absolute',
                transform: 'scale(0.1)'
            });
            this.container.animate({ opacity: 1 }, 200);
            this.container.css({ transform: 'scale(1)' });
        },
        hide() {
            this.container.fadeOut(200);
            this.background.fadeOut(200);
            this.showing = false;
        }
    };
    Loader.interceptFunction(TankTrouble.TankInfoBox, '_initialize', (original, ...args) => {
        original(...args);
        TankTrouble.TankInfoBox._updateFavouriteStatus = function () {};
        if (!TankTrouble.TankInfoBox.infoFavorites) {
            TankTrouble.TankInfoBox.infoFavorites = $('<div class="button" title="Favourites"></div>');
            const standardIcon = $('<img class="standard" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/favourites.png", srcset="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/favourites%402x.png 2x">');
            TankTrouble.TankInfoBox.infoFavorites.append(standardIcon);
            standardIcon.show();
        }
        TankTrouble.TankInfoBox._setFavouriteButtonState = function(state) {
            const imgs = {
                standard: TankTrouble.TankInfoBox.infoFavorites.find('img.standard'),
                active: TankTrouble.TankInfoBox.infoFavorites.find('img.active'),
                disabled: TankTrouble.TankInfoBox.infoFavorites.find('img.disabled')
            };
            Object.values(imgs).forEach(img => img.hide());
            if (state in imgs) imgs[state].show();
        };
        TankTrouble.TankInfoBox.infoFavorites.insertAfter(TankTrouble.TankInfoBox.infoAchievements);
        TankTrouble.TankInfoBox.infoFavorites.tooltipster({ position: 'right', offsetX: 5 });
        TankTrouble.TankInfoBox.infoFavorites.on('mouseup', () => {
            const offset = TankTrouble.TankInfoBox.infoFavorites.offset();
            playersOverlay.show(
                TankTrouble.TankInfoBox.playerId,
                offset.left + TankTrouble.TankInfoBox.infoFavorites.outerWidth() / 2,
                offset.top + TankTrouble.TankInfoBox.infoFavorites.outerHeight() / 2
            );
        });
    });
    Loader.interceptFunction(TankTrouble.TankInfoBox, 'show', (original, ...args) => {
        original(...args);
        const [,, playerId] = args;
        TankTrouble.TankInfoBox.playerId = playerId;
        const actionButtons = [
            TankTrouble.TankInfoBox.infoVirtualShop,
            TankTrouble.TankInfoBox.infoGarage,
            TankTrouble.TankInfoBox.infoAchievements,
            TankTrouble.TankInfoBox.infoAccount,
            TankTrouble.TankInfoBox.infoLogOut
        ];
        const hasVisible = actionButtons.some(btn => btn && btn.is(':visible'));
        TankTrouble.TankInfoBox.infoFavorites.toggle(hasVisible);
    });
});