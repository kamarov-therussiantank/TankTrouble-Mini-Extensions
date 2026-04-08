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

window.whenContentInitialized().then(() => {
	Loader.interceptFunction(TankTrouble.TankInfoBox, '_initialize', (original, ...args) => {
		original(...args);
 
		// Initialize badges Div
		TankTrouble.TankInfoBox.infoBadgesDiv = $('<div class="badge-container"/>');
 
		// Define icons for badges
		TankTrouble.TankInfoBox.infoBadgesIcon1 = $('<img class="badgeIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/premiumBadge.png"/>'); // Premium
		TankTrouble.TankInfoBox.infoBadgesIcon2 = $('<img class="badgeIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/backerBadge.png"/>'); // Kickstarter
		TankTrouble.TankInfoBox.infoBadgesIcon3 = $('<img class="badgeIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/adminBadge.png"/>'); // Admin
		TankTrouble.TankInfoBox.infoBadgesIcon4 = $('<img class="badgeIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/betaBadge.png"/>'); // Beta Tester
		TankTrouble.TankInfoBox.infoBadgesIcon5 = $('<img class="badgeIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/classicBadge.png"/>'); // Classic Player
		TankTrouble.TankInfoBox.infoBadgesIcon6 = $('<img class="badgeIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/addonsBadge.png"/>'); // Addons Team member
		TankTrouble.TankInfoBox.infoBannedIcon = $('<img class="banned-Icon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/banned.png"/>'); // Banned Player
 
		// Create badges
		TankTrouble.TankInfoBox.classicPlayerBadge = $('<div class="classicBadge"/>');
		TankTrouble.TankInfoBox.classicPlayerBadge.append(TankTrouble.TankInfoBox.infoBadgesIcon5);
		TankTrouble.TankInfoBox.classicPlayerBadge.append(TankTrouble.TankInfoBox.classicPlayerText);
		TankTrouble.TankInfoBox.betaTesterBadge = $('<div class="betaTesterBadge"/>');
		TankTrouble.TankInfoBox.betaTesterBadge.append(TankTrouble.TankInfoBox.infoBadgesIcon4);
		TankTrouble.TankInfoBox.premiumBadge = $('<div class="premiumMemberBadge"/>');
		TankTrouble.TankInfoBox.premiumBadge.append(TankTrouble.TankInfoBox.infoBadgesIcon1);
		TankTrouble.TankInfoBox.kickstarterBadge = $('<div class="kickstarterBadge"/>');
		TankTrouble.TankInfoBox.kickstarterBadge.append(TankTrouble.TankInfoBox.infoBadgesIcon2);
		TankTrouble.TankInfoBox.addonsBadge = $('<div class="addonsBadge"/>');
		TankTrouble.TankInfoBox.addonsBadge.append(TankTrouble.TankInfoBox.infoBadgesIcon6);
		TankTrouble.TankInfoBox.adminBadge = $('<div class="adminBadge"/>');
		TankTrouble.TankInfoBox.adminBadge.append(TankTrouble.TankInfoBox.infoBadgesIcon3);
		TankTrouble.TankInfoBox.bannedIcon = $('<div class="bannedIcon"/>');
		TankTrouble.TankInfoBox.bannedIcon.append(TankTrouble.TankInfoBox.infoBannedIcon);
 
    // Experience progress bar
		TankTrouble.TankInfoBox.infoExpDiv = $('<div class="exp tooltipstered"/>');
		TankTrouble.TankInfoBox.infoExpTextDiv = $('<div class="progress"/>');
		TankTrouble.TankInfoBox.infoExpBorder = $('<div class="border"/>');
		TankTrouble.TankInfoBox.infoExpBar = $('<div class="exp-bar"/>');
		TankTrouble.TankInfoBox.infoExpText = $('<span class="exp-text"/>');
		TankTrouble.TankInfoBox.infoExpTextDiv
			.append(TankTrouble.TankInfoBox.infoExpBorder)
			.append(TankTrouble.TankInfoBox.infoExpBar)
			.append(TankTrouble.TankInfoBox.infoExpText);
		TankTrouble.TankInfoBox.infoExpDiv.append(TankTrouble.TankInfoBox.infoExpTextDiv);
		TankTrouble.TankInfoBox.infoExpDiv.insertAfter(TankTrouble.TankInfoBox.infoRank);
 
    // Player additional information element
		TankTrouble.TankInfoBox.infoAboutDiv = $('<div class="tooltipstered"/>');
		TankTrouble.TankInfoBox.infoAboutTextDiv = $('<div class="about-container"/>');
		TankTrouble.TankInfoBox.infoAboutText = $('<span class="about-text"/>');
		TankTrouble.TankInfoBox.infoAboutTextDiv.append(TankTrouble.TankInfoBox.infoAboutText);
		TankTrouble.TankInfoBox.infoAboutDiv.append(TankTrouble.TankInfoBox.infoAboutTextDiv);
		TankTrouble.TankInfoBox.infoAboutDiv.insertAfter(TankTrouble.TankInfoBox.infoName);
 
    // Banned information element
		TankTrouble.TankInfoBox.infoBannedPlayerDiv = $('<div class="tooltipstered"/>');
		TankTrouble.TankInfoBox.infoBannedPlayerTextDiv = $('<div class="bannedText-container"/>');
		TankTrouble.TankInfoBox.infoBannedPlayerText = $('<span class="bannedText-text"/>');
		TankTrouble.TankInfoBox.infoBannedPlayerTextDiv.append(TankTrouble.TankInfoBox.infoBannedPlayerText);
		TankTrouble.TankInfoBox.infoBannedPlayerDiv.append(TankTrouble.TankInfoBox.infoBannedPlayerTextDiv);
		TankTrouble.TankInfoBox.infoBannedPlayerDiv.insertAfter(TankTrouble.TankInfoBox.infoRank);
 
    // Create a container for the icon and text
    TankTrouble.TankInfoBox.infoDeathsDiv = $('<td class="deaths tooltipstered"/>');
    TankTrouble.TankInfoBox.infoDeaths = $(`
    <div class="statsContainer">
        <img class="statsIcon" src="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/deaths.png" srcset="https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Tools/refs/heads/main/uiadditions%26improvements/src/images/assets/tankInfo/deaths@2x.png 2x"/>
        <div class="hasSVG">
            <svg version="1.1" width="58" height="34">
                <text id="deathsTextOutline" x="1" y="22" text-anchor="start" font-family="Arial Black" font-size="14" fill="none" stroke="black" stroke-linejoin="round" stroke-width="3" letter-spacing="1">N/A</text>
                <text id="deathsText" x="1" y="22" text-anchor="start" font-family="Arial Black" font-size="14" fill="white" letter-spacing="1">N/A</text>
            </svg>
        </div>
    </div>
    `);
    TankTrouble.TankInfoBox.infoDeathsDiv.append(TankTrouble.TankInfoBox.infoDeaths);
 
    TankTrouble.TankInfoBox.infoDeathsDiv.tooltipster({
    content: 'Deaths',
    position: 'left',
    offsetX: 5
    });
 
    TankTrouble.TankInfoBox.infoDeathsDiv.insertAfter(TankTrouble.TankInfoBox.infoKillsAndVictoriesTableRow);
 
		// Style badges Div
		TankTrouble.TankInfoBox.infoBadgesDiv.css({
			display: 'flex',
			'align-items': 'center',
			'justify-content': 'center',
			'flex-wrap': 'wrap',
			margin: '0px auto',
			width: 'fit-content'
		});
 
		// Icon Styling
		// Scale the icons
		TankTrouble.TankInfoBox.infoBadgesIcon1.css({
			width: '38px',
			margin: '0'
		});
 
    TankTrouble.TankInfoBox.infoBadgesIcon2.css({
			width: '38px',
			margin: '0'
		});
 
    TankTrouble.TankInfoBox.infoBadgesIcon3.css({
			width: '102px',
			margin: '0'
		});
 
    TankTrouble.TankInfoBox.infoBadgesIcon4.css({
			width: '38px',
			margin: '0'
		});
 
    TankTrouble.TankInfoBox.infoBadgesIcon5.css({
			width: '38px',
			margin: '0'
		});

    TankTrouble.TankInfoBox.infoBadgesIcon6.css({
			width: '38px',
			margin: '0'
		});
 
    TankTrouble.TankInfoBox.infoBannedIcon.css({
			width: '200px',
			margin: '0',
		});
 
    TankTrouble.TankInfoBox.classicPlayerBadge.tooltipster({
			position: 'top',
			offsetX: 0
		});
 
    TankTrouble.TankInfoBox.betaTesterBadge.tooltipster({
			position: 'top',
			offsetX: 0
		});
 
    TankTrouble.TankInfoBox.premiumBadge.tooltipster({
			position: 'top',
			offsetX: 0
		});
 
    TankTrouble.TankInfoBox.kickstarterBadge.tooltipster({
			position: 'top',
			offsetX: 0
		});
    
    TankTrouble.TankInfoBox.addonsBadge.tooltipster({
			position: 'top',
			offsetX: 0
		});
 
		TankTrouble.TankInfoBox.infoExpDiv.tooltipster({
			position: 'right',
			offsetX: 5
		});
 
		// Append all elements
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.classicPlayerBadge);
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.betaTesterBadge);
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.premiumBadge);
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.kickstarterBadge);
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.adminBadge);
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.addonsBadge);
		TankTrouble.TankInfoBox.infoBadgesDiv.append(TankTrouble.TankInfoBox.bannedIcon);
		TankTrouble.TankInfoBox.infoBadgesDiv.insertBefore(TankTrouble.TankInfoBox.infoRank);
 
		// Hide badges by default
		TankTrouble.TankInfoBox.infoExpDiv.hide();
		TankTrouble.TankInfoBox.infoBadgesDiv.hide();
		TankTrouble.TankInfoBox.classicPlayerBadge.hide();
		TankTrouble.TankInfoBox.betaTesterBadge.hide();
		TankTrouble.TankInfoBox.premiumBadge.hide();
		TankTrouble.TankInfoBox.kickstarterBadge.hide();
		TankTrouble.TankInfoBox.adminBadge.hide();
		TankTrouble.TankInfoBox.addonsBadge.hide();
	});
 
  // Display
    Loader.interceptFunction(TankTrouble.TankInfoBox, 'show', (original, ...args) => {
        original(...args);
 
        TankTrouble.TankInfoBox.classicPlayerBadge.tooltipster('content', 'Classic Player');
        TankTrouble.TankInfoBox.betaTesterBadge.tooltipster('content', 'Beta Tester');
        TankTrouble.TankInfoBox.premiumBadge.tooltipster('content', 'Premium Member');
        TankTrouble.TankInfoBox.kickstarterBadge.tooltipster('content', 'Kickstarter Backer');
        TankTrouble.TankInfoBox.addonsBadge.tooltipster('content', 'Addons Team Member');
        TankTrouble.TankInfoBox.infoExpDiv.tooltipster('content', 'Classic EXP');
 
        const [,, playerId] = args;
 
        Backend.getInstance().getPlayerDetails(result => {
            if (typeof result === 'object') {
                const playerId = result.getPlayerId();
                const username = result.getUsername();
                const addonsTeamMembers = ["kamarov", "commander"].includes(username);
                const banned = result.getBanned();
                const classicPlayer = result.getExperience();
                const premiumMember = result.getPremium();
                const betaTester = result.getBeta();
                const adminMember = result.getGmLevel();
                const deaths = result.getDeaths();
                const lastLogin = result.getLastLogin();
                const exp = classicPlayer;
 
                $("#deathsTextOutline").text(deaths);
                $("#deathsText").text(deaths);
 
                if (deaths > 100000) {
                    $("#deathsTextOutline").attr("font-size", "12"); // Increase font size
                    $("#deathsText").attr("font-size", "12"); // Increase font size
                } else {
                    $("#deathsTextOutline").attr("font-size", "14"); // Default size
                    $("#deathsText").attr("font-size", "14"); // Default size
                }
 
                // Always show the badges div
                TankTrouble.TankInfoBox.infoBadgesDiv.show();
 
                // Kickstarter Badge
                Backend.getInstance().ajax.getBackers(backerResult => {
                    const backers = backerResult.result.data;
 
                    if (backers.includes(username)) {
                        TankTrouble.TankInfoBox.kickstarterBadge.show();
                    } else {
                        TankTrouble.TankInfoBox.kickstarterBadge.hide();
                    }
                });
 
                // Classic Player badge & Experience progress bar
                if (classicPlayer && classicPlayer > 0) {
                    TankTrouble.TankInfoBox.infoExpDiv.show();
                    TankTrouble.TankInfoBox.classicPlayerBadge.show();
                    TankTrouble.TankInfoBox.infoExpText.text(`${exp}`);
                } else {
                    TankTrouble.TankInfoBox.infoExpDiv.hide();
                    TankTrouble.TankInfoBox.classicPlayerBadge.hide();
                }

                if (addonsTeamMembers) {
                    TankTrouble.TankInfoBox.addonsBadge.show();
                } else {
                    TankTrouble.TankInfoBox.addonsBadge.hide();
                }
 
                // Display player info or banned message
                if (banned) {
                    TankTrouble.TankInfoBox.bannedIcon.show();
                    TankTrouble.TankInfoBox.infoAboutDiv.show();
                    TankTrouble.TankInfoBox.infoAboutText.text(`#${playerId}`);
                    TankTrouble.TankInfoBox.infoBannedPlayerDiv.show();
                    TankTrouble.TankInfoBox.infoBannedPlayerText.text(`Player has been permanently banned because of rules violation. Player statistics are counted towards the scrapyard.`);
                    document.querySelector(".about-container").style.color = "#fff";
                    document.querySelector("#tankinfo .rank").style.display = "none";
                    document.querySelector("#tankinfo .xp").style.display = "none";
                    document.querySelector(".exp.tooltipstered").style.display = "none";
                    document.querySelector("#tankinfo table").style.display = "none";
                    document.querySelector(".actions.centered").style.display = "none";
                } else if (playerId) {
                    TankTrouble.TankInfoBox.bannedIcon.hide();
                    TankTrouble.TankInfoBox.infoBannedPlayerDiv.hide();
                    TankTrouble.TankInfoBox.infoAboutDiv.show();
                    TankTrouble.TankInfoBox.infoAboutText.text(`#${playerId}`);
                    document.querySelector(".about-container").style.color = "";
                    document.querySelector("#tankinfo .rank").style.display = "";
                    document.querySelector("#tankinfo .xp").style.display = "";
                    document.querySelector("#tankinfo table").style.display = "";
                    document.querySelector(".actions.centered").style.display = "";
                } else {
                    TankTrouble.TankInfoBox.infoAboutDiv.hide();
                    document.querySelector(".exp.tooltipstered").style.display = "";
                }
 
                // Show or hide other badges
                premiumMember ? TankTrouble.TankInfoBox.premiumBadge.show() : TankTrouble.TankInfoBox.premiumBadge.hide();
                betaTester ? TankTrouble.TankInfoBox.betaTesterBadge.show() : TankTrouble.TankInfoBox.betaTesterBadge.hide();
                adminMember ? TankTrouble.TankInfoBox.adminBadge.show() : TankTrouble.TankInfoBox.adminBadge.hide();
            } else {
                TankTrouble.TankInfoBox.infoBadgesDiv.hide();
            }
 
        }, () => {}, () => {}, playerId, Caches.getPlayerDetailsCache());
    });

});

