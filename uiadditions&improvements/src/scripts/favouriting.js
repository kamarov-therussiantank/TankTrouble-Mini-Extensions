// Favourites System
whenContentInitialized().then(() => {
    const KEY = "favourites";
    function getFavourites() {
        return JSON.parse(localStorage.getItem(KEY) || "[]");
    }
    function setFavourites(list) {
        localStorage.setItem(KEY, JSON.stringify(list));
    }
    function isFavourite(id) {
        return getFavourites().includes(String(id));
    }
    function addFavourite(id) {
        id = String(id);
        const list = getFavourites();
        if (!list.includes(id)) {
            list.push(id);
            setFavourites(list);
        }
    }
    function removeFavourite(id) {
        id = String(id);
        const list = getFavourites().filter(
            x => x !== id
        );
        setFavourites(list);
    }
    Loader.interceptFunction(TankTrouble.TankInfoBox, '_initialize', (original, ...args) => {
            original(...args);
            TankTrouble.TankInfoBox._updateFavouriteStatus = function() {};
            if (!TankTrouble.TankInfoBox.infoFavouriteStarOn.parent().length) {
                TankTrouble.TankInfoBox.infoFavouriteStarOn.insertBefore(TankTrouble.TankInfoBox.infoGameJoin);
            }
            if (!TankTrouble.TankInfoBox.infoFavouriteStarOff.parent().length) {
                TankTrouble.TankInfoBox.infoFavouriteStarOff.insertBefore(TankTrouble.TankInfoBox.infoGameJoin);
            }
            TankTrouble.TankInfoBox.infoFavouriteStarOn
                .off(".customFav");
            TankTrouble.TankInfoBox.infoFavouriteStarOff
                .off(".customFav");
            TankTrouble.TankInfoBox.infoFavouriteStarOff.on(
                "mouseup.customFav",
                function() {
                    if (!TankTrouble.TankInfoBox.showing)
                        return;
                    addFavourite(TankTrouble.TankInfoBox.playerId);
                    TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
                    TankTrouble.TankInfoBox.infoFavouriteStarOn.show();
                    if (TankTrouble.TankInfoBox.username) {
                        TankTrouble.TankInfoBox.infoFavouriteStarOn.tooltipster(
                            'content', 'Remove ' + TankTrouble.TankInfoBox.username + ' from favourites'
                        );
                    }
                }
            );
            TankTrouble.TankInfoBox.infoFavouriteStarOn.on(
                "mouseup.customFav",
                function() {
                    if (!TankTrouble.TankInfoBox.showing)
                        return;
                    removeFavourite(TankTrouble.TankInfoBox.playerId);
                    TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
                    TankTrouble.TankInfoBox.infoFavouriteStarOff.show();
                    if (TankTrouble.TankInfoBox.username) {
                        TankTrouble.TankInfoBox.infoFavouriteStarOff.tooltipster(
                            'content', 'Add ' + TankTrouble.TankInfoBox.username + ' to favourites'
                        );
                    }
                }
            );
        }
    );
    Loader.interceptFunction(TankTrouble.TankInfoBox, 'show', (original, ...args) => {
            original(...args);
            const playerId = String(args[2]);
            const localPlayers =
                Users.getAllPlayerIds()
                .map(String);
            if (localPlayers.includes(playerId)) {
                TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
                TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
                return;
            }
            const blockingButtons = [
                TankTrouble.TankInfoBox.infoAdminLookup,
                TankTrouble.TankInfoBox.infoSignUp,
                TankTrouble.TankInfoBox.infoAccount,
                TankTrouble.TankInfoBox.infoAdmin,
                TankTrouble.TankInfoBox.infoLogOut
            ];
            const anyBlockingVisible =
                blockingButtons.some(
                    btn => btn.is(':visible')
                );
            if (anyBlockingVisible) {
                TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
                TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
                return;
            }
            if (isFavourite(playerId)) {
                TankTrouble.TankInfoBox.infoFavouriteStarOn
                    .show()
                    .removeClass("disabled");
                TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
            } else {
                TankTrouble.TankInfoBox.infoFavouriteStarOff
                    .show()
                    .removeClass("disabled");
                TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
            }
            if (TankTrouble.TankInfoBox.username) {
                TankTrouble.TankInfoBox.infoFavouriteStarOn.tooltipster(
                    'content', 'Remove ' + TankTrouble.TankInfoBox.username + ' from favourites'
                );
                TankTrouble.TankInfoBox.infoFavouriteStarOff.tooltipster(
                    'content', 'Add ' + TankTrouble.TankInfoBox.username + ' to favourites'
                );
            }
        }
    );

});