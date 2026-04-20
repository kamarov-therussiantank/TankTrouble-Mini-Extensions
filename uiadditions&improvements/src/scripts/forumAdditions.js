//Forum Additions script
whenContentInitialized().then(() => {
    let hooked = false;
    const coCreators = (thread, threadElement) => {
        threadElement.find('.reply-row').remove();
        const creators = {
            creator: thread.creator,
            ...(thread.coCreator1 && { coCreator1: thread.coCreator1 }),
            ...(thread.coCreator2 && { coCreator2: thread.coCreator2 })
        };
        const container = threadElement.find('.container');
        const row = $('<div/>').addClass('reply-row').insertBefore(container);
        const tanks = $('<div/>')
            .addClass(`tanks tankCount${Object.keys(creators).length}`)
            .appendTo(row);
        row.append(container);
        for (const [creatorType, playerId] of Object.entries(creators)) {
            const tank = $('<div/>')
                .addClass(`tank ${creatorType}`)
                .appendTo(tanks);
            const canvas = document.createElement('canvas');
            canvas.width = UIConstants.TANK_ICON_WIDTH_SMALL;
            canvas.height = UIConstants.TANK_ICON_HEIGHT_SMALL;
            canvas.style.width =
                `${UIConstants.TANK_ICON_RESOLUTIONS[UIConstants.TANK_ICON_SIZES.SMALL]}px`;
            canvas.style.height =
                `${UIConstants.TANK_ICON_RESOLUTIONS[UIConstants.TANK_ICON_SIZES.SMALL] * 0.6}px`;
            canvas.addEventListener('mouseup', () => {
                const rect = canvas.getBoundingClientRect();
                const win = canvas.ownerDocument.defaultView;
                TankTrouble.TankInfoBox.show(
                    rect.left + win.scrollX + canvas.clientWidth / 2,
                    rect.top + win.scrollY + canvas.clientHeight / 2,
                    playerId,
                    canvas.clientWidth / 2,
                    canvas.clientHeight / 4
                );
            });
            UITankIcon.loadPlayerTankIcon(
                canvas,
                UIConstants.TANK_ICON_SIZES.SMALL,
                playerId
            );
            tank.append(canvas);
        }
        Backend.getInstance().getPlayerDetails(result => {
            const username =
                typeof result === 'object'
                    ? Utils.maskUnapprovedUsername(result)
                    : 'Scrapped';
            $('<div/>')
                .addClass('playerUsername')
                .text(username)
                .appendTo(tanks.find('.tank.creator'));
        }, () => {}, () => {}, creators.creator, Caches.getPlayerDetailsCache());
    };
    const hyperlinks = (_threadOrReply, el) => {
        const content = el.find('.bubble .content');
        if (!content.length) return;
        const urlRegex = /(?<_>https?:\/\/[\w\-_]+(?:\.[\w\-_]+)+(?:[\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?)/gu;
        content.html(content.html().replace(urlRegex, '<a href="$1" target="_blank">$1</a>'));
    };
    const handleItems = item => {
        if (!item || !item.html) return;
        const key = Object.keys(item.html).find(k => k !== 'backup');
        const html = item.html[key];
        if (typeof html === 'string') {
            const el = $($.parseHTML(html));
            coCreators(item, el);
            hyperlinks(item, el);
            item.html[key] = el;
            item.html.backup = html;
        } else if (html instanceof $ && item.html.backup) {
            const el = $($.parseHTML(item.html.backup));
            coCreators(item, el);
            item.html[key] = el;
        }
    };
    let storedThreads = JSON.parse(localStorage.getItem('forum')) || [];
    function storeThreads() {
        let changed = false;
        $('.thread').each(function () {
            const threadId = parseInt($(this).attr('id')?.replace('thread-', '') || 0, 10);
            const header = $(this).find('.header').text().trim();
            const creator = $(this).find('.playerUsername').text().trim().toLowerCase();
            if (!creator) return;
            const existing = storedThreads.find(t => t.id === threadId);
            if (!existing) {
                storedThreads.push({ id: threadId, header, creator });
                changed = true;
            } else {
                if (existing.creator !== creator || existing.header !== header) {
                    existing.creator = creator;
                    existing.header = header;
                    changed = true;
                }
            }
        });
        if (changed) {
            localStorage.setItem('forum', JSON.stringify(storedThreads));
        }
    }
    if (!hooked) {
        hooked = true;
        const tlc = ForumView.getMethod('threadListChanged');
        ForumView.method('threadListChanged', function (...args) {
            const list = args[0];
            list.forEach(handleItems);
            const result = tlc.apply(this, args);
            storeThreads();
            return result;
        });
        const rlc = ForumView.getMethod('replyListChanged');
        ForumView.method('replyListChanged', function (...args) {
            const list = args[0];
            list.forEach(handleItems);
            return rlc.apply(this, args);
        });
        const gst = ForumModel.getMethod('getSelectedThread');
        ForumModel.method('getSelectedThread', function (...args) {
            const result = gst.apply(this, args);
            handleItems(result);
            return result;
        });
    }
    function injectSearchBar() {
        const threadsWrapper = $('#threadsWrapper');
        if (!threadsWrapper.length || $('#forumSearchBar').length) return;
        const searchBar = $(`
            <div id="forumSearchBar">
                <div id="forumSearchInputWrapper">
                    <input type="text" id="forumSearchInput" placeholder="Search...">
                </div>
                <div id="forumSearchSuggestions"></div>
            </div>
        `);
        threadsWrapper.before(searchBar);
        const input = $('#forumSearchInput');
        const suggestions = $('#forumSearchSuggestions');
        function performSearch() {
            const query = input.val().toLowerCase().trim();
            if (!query) return suggestions.hide();
            const match = storedThreads.find(t =>
                t.header.toLowerCase().includes(query)
            );
            if (match) {
                window.location.href = `https://tanktrouble.com/forum?threadId=${match.id}`;
            }
            suggestions.hide();
        }
        input.on('input', function () {
            const query = $(this).val().toLowerCase().trim();
            suggestions.empty();
            if (!query) return suggestions.hide();
            let matches = storedThreads.filter(t =>
                t.creator && t.creator.includes(query)
            );
            if (!matches.length) {
                matches = storedThreads.filter(t =>
                    t.header.toLowerCase().includes(query)
                );
            }
            if (!matches.length) return suggestions.hide();
            matches.forEach(thread => {
                const item = $(`
                    <div style="padding:6px; cursor:pointer; display:flex; justify-content:space-between;">
                        <span>${thread.header}</span>
                        <div class="deleteSuggestion">✖</div>
                    </div>
                `);
                item.on('click', () => {
                    window.location.href = `https://tanktrouble.com/forum?threadId=${thread.id}`;
                });
                item.find('.deleteSuggestion').on('click', (e) => {
                    e.stopPropagation();
                    storedThreads = storedThreads.filter(t => t.id !== thread.id);
                    localStorage.setItem('forum', JSON.stringify(storedThreads));
                    item.remove();
                });
                suggestions.append(item);
            });
            suggestions.show();
        });
        input.on('keypress', e => {
            if (e.key === 'Enter') performSearch();
        });
        $(document).on('click', e => {
            if (!$(e.target).closest('#forumSearchBar').length) {
                suggestions.hide();
            }
        });
    }
    function updateSearchBarVisibility() {
        const searchBar = $('#forumSearchBar');
        const threadsWrapper = $('#threadsWrapper');
        const repliesWrapper = $('#repliesWrapper');
        if (!searchBar.length) return;
        const threadsVisible = threadsWrapper.css('display') !== 'none';
        const repliesVisible = repliesWrapper.css('display') !== 'none';
        if (repliesVisible && !threadsVisible) {
            searchBar.hide();
        } else {
            searchBar.show();
        }
    }
    injectSearchBar();
    new MutationObserver(() => {
        injectSearchBar();
        updateSearchBarVisibility();
    })
    .observe(document.body, { childList: true, subtree: true });
});