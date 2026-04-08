whenContentInitialized().then(() => {
    const FAV_KEY = "tt_custom_favourites";
    function getFavourites() {
        return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    }
    function setFavourites(list) {
        localStorage.setItem(FAV_KEY, JSON.stringify(list));
    }
    function isFavourite(id) {
        return getFavourites().includes(id);
    }
    function addFavourite(id) {
        const list = getFavourites();
        if (!list.includes(id)) {
            list.push(id);
            setFavourites(list);
        }
    }
    function removeFavourite(id) {
        const list = getFavourites().filter(x => x !== id);
        setFavourites(list);
    }
    Loader.interceptFunction(TankTrouble.TankInfoBox, '_initialize', (original, ...args) => {
        original(...args);
        TankTrouble.TankInfoBox._updateFavouriteStatus = function () {};
        TankTrouble.TankInfoBox.infoFavouriteStarOn.insertBefore(TankTrouble.TankInfoBox.infoGameJoin);
        TankTrouble.TankInfoBox.infoFavouriteStarOff.insertBefore(TankTrouble.TankInfoBox.infoGameJoin);
        TankTrouble.TankInfoBox.infoFavouriteStarOn.tooltipster({
            position: 'left',
            offsetX: 5
        });
        TankTrouble.TankInfoBox.infoFavouriteStarOff.tooltipster({
            position: 'left',
            offsetX: 5
        });
        TankTrouble.TankInfoBox.infoFavouriteStarOff
            .off("mouseup.customFav")
            .on("mouseup.customFav", function () {
                if (!TankTrouble.TankInfoBox.showing) return;
                addFavourite(TankTrouble.TankInfoBox.playerId);
                TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
                TankTrouble.TankInfoBox.infoFavouriteStarOn.show();
            });
        TankTrouble.TankInfoBox.infoFavouriteStarOn
            .off("mouseup.customFav")
            .on("mouseup.customFav", function () {
                if (!TankTrouble.TankInfoBox.showing) return;
                removeFavourite(TankTrouble.TankInfoBox.playerId);
                TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
                TankTrouble.TankInfoBox.infoFavouriteStarOff.show();
            });
    });
    Loader.interceptFunction(TankTrouble.TankInfoBox, 'show', (original, ...args) => {
        original(...args);
        const [,, playerId] = args;
            const blockingButtons = [
            TankTrouble.TankInfoBox.infoAdminLookup,
            TankTrouble.TankInfoBox.infoSignUp,
            TankTrouble.TankInfoBox.infoAccount,
            TankTrouble.TankInfoBox.infoAdmin,
            TankTrouble.TankInfoBox.infoLogOut
        ];
        const anyBlockingVisible = blockingButtons.some(btn => btn.is(':visible'));
        if (isFavourite(playerId)) {
            TankTrouble.TankInfoBox.infoFavouriteStarOn.show();
            TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
        } else {
            TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
            TankTrouble.TankInfoBox.infoFavouriteStarOff.show();
        }
        if (anyBlockingVisible) {
            TankTrouble.TankInfoBox.infoFavouriteStarOn.hide();
            TankTrouble.TankInfoBox.infoFavouriteStarOff.hide();
    }});
});