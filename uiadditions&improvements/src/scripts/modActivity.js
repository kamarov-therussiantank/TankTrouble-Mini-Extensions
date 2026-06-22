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

// Mod Activity Snippet
whenContentInitialized().then(() => {
const snippet = $(`
    <div id="modActivitySnippet" class="snippet">
        <div class="header">Mod Activity</div>
        <div id="mod-activity"></div>
    </div>
`);
$('#tertiaryContent').append(snippet);

//Script
    const usernamesToLookup = TankTrouble.WallOfFame.admins;
    let modEntries = [];
    let emptyMessageIndex = 0;
    const emptyMessage = [
        "Fetching.",
        "Fetching..",
        "Fetching...",
    ];
    function fetchModDataAndUpdateUI() {
        const playerDetailsList = [];
        let completedRequests = 0;
        modEntries = [];
        snippet.find('#mod-activity').empty();
        snippet.find('#mod-activity').html(`<p class="empty" id="modActivityEmpty"></p>`);
        const msgElement = document.getElementById("modActivityEmpty");
        function setNextMessage() {
            if (msgElement) {
                msgElement.textContent = emptyMessage[emptyMessageIndex];
                emptyMessageIndex = (emptyMessageIndex + 1) % emptyMessage.length;
            }
        }
        setNextMessage();
        clearInterval(window.modActivityEmptyInterval);
        window.modActivityEmptyInterval = setInterval(setNextMessage, 1000);
        usernamesToLookup.forEach(username => {
            Backend.getInstance().getPlayerDetailsByUsername(
                (result) => {
                    completedRequests++;
                    if (
                        result &&
                        typeof result.getUsername === 'function' &&
                        typeof result.getLastLogin === 'function' &&
                        typeof result.getGmLevel === 'function' &&
                        result.getGmLevel() >= 1
                    ) {
                        playerDetailsList.push(result);
                    }
                    if (completedRequests === usernamesToLookup.length) {
                    clearInterval(window.modActivityEmptyInterval);
                    snippet.find('#mod-activity').empty();
                        playerDetailsList
                        const sorted = playerDetailsList
                            .sort((a, b) => b.getLastLogin() - a.getLastLogin())
                            .slice(0, 3)
                            if (!sorted.length) {
                            snippet.find('#mod-activity').html(`<p class="empty" id="modActivityEmpty"></p>`);
                            const msgElement = document.getElementById("modActivityEmpty");
                            function setNextMessage() {
                                msgElement.textContent = emptyMessage[emptyMessageIndex];
                                emptyMessageIndex = (emptyMessageIndex + 1) % emptyMessage.length;
                            }
                            setNextMessage();
                            clearInterval(window.modActivityEmptyInterval);
                            window.modActivityEmptyInterval = setInterval(setNextMessage, 1000);
                            return;
                            }
                            sorted.forEach(player => {
                                const username = player.getUsername();
                                const lastLogin = parseInt(player.getLastLogin(), 10);
                                const userRow = $(`
                                    <div class="mod-entry">
                                        <span class="mod-username"><div>${username}</div></span>
                                        <span class="mod-last-login" title="${new Date(lastLogin * 1000).toLocaleString()}">${getTimeAgo(lastLogin)}</span>
                                    </div>
                                `);
                                snippet.find('#mod-activity').append(userRow);

                                modEntries.push({
                                    lastLogin,
                                    element: userRow.find('.mod-last-login')
                                });
                            });
                        updateTimeAgoEntries();
                    }
                },
                (errorMessage) => {
                    completedRequests++;
                    snippet.find('#mod-activity').append(`<p>Error fetching player details: ${errorMessage}</p>`);
                },
                null,
                username,
                Caches.getPlayerDetailsCache()
            );
        });
    }
    function updateTimeAgoEntries() {
        modEntries.forEach(({ lastLogin, element }) => {
            element.text(getTimeAgo(lastLogin));
        });
    }
    let nextRefreshTimestamp = null;
    function scheduleNextRealTimeRefresh() {
        const now = Date.now();
        const nextMinute = new Date(now);
        nextMinute.setSeconds(0);
        nextMinute.setMilliseconds(0);
        nextMinute.setMinutes(nextMinute.getMinutes() + 1);
        nextRefreshTimestamp = nextMinute.getTime();
        const delay = nextRefreshTimestamp - now;
        setTimeout(() => {
            fetchModDataAndUpdateUI();
            scheduleNextRealTimeRefresh();
        }, delay);
    }
    fetchModDataAndUpdateUI();
    scheduleNextRealTimeRefresh();
    setInterval(updateTimeAgoEntries, 60000);
});