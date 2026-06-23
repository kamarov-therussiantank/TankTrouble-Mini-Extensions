// Activity Snippet
whenContentInitialized().then(() => {
    const snippet = $(`
    <div id="activitySnippet" class="snippet">
        <div class="header">Activity:</div>
        <div id="playersOnline">...</div>
        <div id="gamesMade"></div>
    </div>
    `);
    $('#secondaryContent').append(snippet);

    let statsType = 'global';
    TankTrouble.Statistics = {
    _updateNumber: function(element, newValue, suffix) {
        var textContent = element.text();
        var number = parseInt(textContent, 10);
        if (!isNaN(number)) {
            if (number != newValue) {
                var oldColor = element.css('color');
                if (newValue > number) {
                    $({
                        value: number
                    }).animate({
                        value: newValue
                    }, {
                        duration: 2000,
                        easing: 'easeOutQuad',
                        step: function() {
                            var ceiledValue = Math.ceil(this.value);
                            var finalSuffix = "";
                            if (suffix) {
                                finalSuffix = suffix + (ceiledValue != 1 ? "s" : "");
                            }
                            element.text(ceiledValue + " " + finalSuffix);
                        }
                    });
                    element.addClass('positive');
                    element.switchClass('positive', '', 2000, 'easeOutQuad');
                } else {
                    $({
                        value: number
                    }).animate({
                        value: newValue
                    }, {
                        duration: 2000,
                        easing: 'easeOutQuad',
                        step: function() {
                            var flooredValue = Math.floor(this.value);
                            var finalSuffix = "";
                            if (suffix) {
                                finalSuffix = suffix + (flooredValue != 1 ? "s" : "");
                            }
                            element.text(flooredValue + " " + finalSuffix);
                        }
                    });
                    element.addClass('negative');
                    element.switchClass('negative', '', 2000, 'easeOutQuad');
                }
            }
        } else {
            var finalSuffix = "";
            if (suffix) {
                finalSuffix = suffix + (newValue != 1 ? "s" : "");
            }
            element.text(newValue + " " + finalSuffix);
        }
    },
    _updateStatistics: function() {
        var self = this;
        Backend.getInstance().getStatistics(function(result) {
            self._updateNumber($("#playersOnline"), result.onlineStatistics.playerCount);
            self._updateNumber($("#gamesMade"), result.onlineStatistics.gameCount, "game");
            $("#activitySnippet").css("display", "inline-block");
        }, function(result) {})
    },
    init: function() {
        var self = this;
        setInterval(function() {self._updateStatistics();}, 5000);
    }
};
TankTrouble.Statistics.init();
});