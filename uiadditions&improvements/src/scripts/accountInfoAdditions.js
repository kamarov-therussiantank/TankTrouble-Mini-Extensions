function whenContentInitialized() {
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
}

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

window.getTimeAgo = function(unixTimestampInSeconds) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const secondsAgo = nowSeconds - unixTimestampInSeconds;
    const minute = 60;
    const hour = 3600;
    const day = 86400;
    const week = day * 7;
    const month = day * 30.44;
    const year = day * 365.25;

    if (secondsAgo < minute) {
        return `${secondsAgo} seconds${secondsAgo !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < hour) {
        const minutes = Math.floor(secondsAgo / minute);
        return `${minutes} minutes${minutes !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < day) {
        const hours = Math.floor(secondsAgo / hour);
        return `${hours} hours${hours !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < week) {
        const days = Math.floor(secondsAgo / day);
        return `${days} days${days !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < month) {
        const weeks = Math.floor(secondsAgo / week);
        return `${weeks} weeks${weeks !== 1 ? 's' : ''} ago`;
    } else if (secondsAgo < year) {
        const months = Math.floor(secondsAgo / month);
        return `${months} months${months !== 1 ? 's' : ''} ago`;
    } else {
        const years = Math.floor(secondsAgo / year);
        return `${years} years${years !== 1 ? 's' : ''} ago`;
    }
}

whenContentInitialized().then(() => {
	Loader.interceptFunction(TankTrouble.AccountOverlay, '_initialize', (original, ...args) => {
		original(...args);

		// Create container div
		TankTrouble.AccountOverlay.accountContainer = $('<div class="account-details"></div>');
		TankTrouble.AccountOverlay.accountContainer.insertAfter(TankTrouble.AccountOverlay.accountHeadline);

		// Create and append each detail div inside the container
		TankTrouble.AccountOverlay.accountCreated = $('<div></div>').appendTo(TankTrouble.AccountOverlay.accountContainer);
		TankTrouble.AccountOverlay.accountCountry = $('<div></div>').appendTo(TankTrouble.AccountOverlay.accountContainer);
		TankTrouble.AccountOverlay.accountID = $('<div></div>').appendTo(TankTrouble.AccountOverlay.accountContainer);
		TankTrouble.AccountOverlay.accountVerification = $('<div></div>').appendTo(TankTrouble.AccountOverlay.accountContainer);
		TankTrouble.AccountOverlay.accountNewsSubscriber = $('<div></div>').appendTo(TankTrouble.AccountOverlay.accountContainer);
		TankTrouble.AccountOverlay.accountLastLogin = $('<div></div>').appendTo(TankTrouble.AccountOverlay.accountContainer);
	});

	Loader.interceptFunction(TankTrouble.AccountOverlay, 'show', (original, ...args) => {
		original(...args);

	Backend.getInstance().getPlayerDetails(result => {
            if (typeof result === 'object') {
                const accountVerification = result.getVerified();
                const accountID = result.getPlayerId();
                const created = new Date(result.getCreated() * 1000);
                const accountLastLogin = result.getLastLogin();

                const formatted = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(created);

                TankTrouble.AccountOverlay.accountCreated.text(`Created: ${formatted}`);
                TankTrouble.AccountOverlay.accountID.text(`Player ID: #${accountID}`);
                TankTrouble.AccountOverlay.accountVerification.text(`Verified: ${accountVerification ? 'Yes' : 'No'}`);
                TankTrouble.AccountOverlay.accountLastLogin.text(`Last login: ${accountLastLogin ? getTimeAgo(accountLastLogin) : 'Never'}`);
            }
        }, () => {}, () => {}, TankTrouble.AccountOverlay.playerId, Caches.getPlayerDetailsCache());
	});
});