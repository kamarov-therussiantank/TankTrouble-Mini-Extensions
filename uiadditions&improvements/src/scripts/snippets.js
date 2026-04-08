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

// Leaderboard snippet
whenContentInitialized().then(async () => {
    const snippet = document.createElement("div");
    snippet.id = "leaderboardSnippet";
    snippet.className = "snippet";
    snippet.innerHTML = `
        <div class="header">Leaderboard</div>
        <div class="content"></div>
        <select id="snippetStat" class="buttons">
            <option value="kills">Kills</option>
            <option value="victories">Victories</option>
            <option value="rank">Rank</option>
        </select>
    `;
    document.querySelector("#tertiaryContent").appendChild(snippet);

//Script
const statSelect = document.getElementById("snippetStat");
    await loadAndRenderLeaderboard(statSelect.value);
    statSelect.addEventListener("change", e => {
        loadAndRenderLeaderboard(e.target.value);
    });
    setInterval(() => loadAndRenderLeaderboard(statSelect.value), 1000);
});
let emptyMessageIndex = 0;
const emptyMessage = [
    "Fetching.",
    "Fetching..",
    "Fetching...",
];
async function fetchOnlinePlayers() {
    const players = [];
    try {
        const gameStates = ClientManager.getClient().getAvailableGameStates();
        for (const gameState of gameStates) {
            const playerStates = gameState.getPlayerStates();
            for (const player of playerStates) {
                const playerId = player.getPlayerId();
                await new Promise(resolve => {
                    Backend.getInstance().getPlayerDetails(
                        result => {
                            if (result && result.getUsername().toLowerCase() !== "laika") {
                                players.push({
                                    playerId: playerId,
                                    username: result.getUsername(),
                                    kills: result.getKills(),
                                    victories: result.getVictories(),
                                    rank: result.getRank()
                                });
                            }
                            resolve();
                        },
                        err => resolve(),
                        null,
                        playerId,
                        Caches.getPlayerDetailsCache()
                    );
                });
            }
        }
    } catch (err) {
        console.error("Failed to fetch online players:", err);
    }
    return players;
}
function getTopPlayers(players, stat="kills") {
    return players.sort((a,b) => b[stat] - a[stat]).slice(0,10);
}
function renderLeaderboard(players, stat="kills") {
    const container = document.querySelector("#leaderboardSnippet .content");
    container.innerHTML = "";
    if (!players.length) {
    container.innerHTML = "<p class='empty' id='leaderboardEmpty'></p>";
    const msgElement = document.getElementById("leaderboardEmpty");
        function setNextMessage() {
            msgElement.textContent = emptyMessage[emptyMessageIndex];
            emptyMessageIndex = (emptyMessageIndex + 1) % emptyMessage.length;
        }
        setNextMessage();
        clearInterval(window.leaderboardEmptyInterval);
        window.leaderboardEmptyInterval = setInterval(setNextMessage, 1000);
    }
    const ul = document.createElement("ul");
    ul.className = "leaderboard-snippet-list";
    for (const p of players) {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="username">${p.username}</span>
            <span class="stat">${p[stat].toLocaleString("en-US")}</span>
        `;
        ul.appendChild(li);
    }
    container.appendChild(ul);
}
async function loadAndRenderLeaderboard(stat="kills") {
    const players = await fetchOnlinePlayers();
    const topPlayers = getTopPlayers(players, stat);
    renderLeaderboard(topPlayers, stat);
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