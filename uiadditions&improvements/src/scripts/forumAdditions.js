// Forum Additions
whenContentInitialized().then(() => {
    const coCreators = (thread, threadElement) => {
        threadElement.find('.reply-row').remove();

        const creators = {
            creator: thread.creator,
            ...(thread.coCreator1 && { coCreator1: thread.coCreator1 }),
            ...(thread.coCreator2 && { coCreator2: thread.coCreator2 })
        };

        const container = threadElement.find('.container');
        const row = $('<div/>')
            .addClass('reply-row')
            .insertBefore(container);
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
    const hyperlinks = (_threadOrReply, threadOrReplyElement) => {
		const threadOrReplyContent = threadOrReplyElement.find('.bubble .content');
		if (threadOrReplyContent.length) {
			const urlRegex = /(?<_>https?:\/\/[\w\-_]+(?:\.[\w\-_]+)+(?:[\w\-.,@?^=%&amp;:/~+#]*[\w\-@?^=%&amp;/~+#])?)/gu;
			const links = threadOrReplyContent.html().replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
			threadOrReplyContent.html(links);
		}
	};
    const handleItems = item => {
        if (!item || !item.html) return;
        const [key] = Object.keys(item.html);
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
    const tlc = ForumView.getMethod('threadListChanged');
    ForumView.method('threadListChanged', function (...args) {
        const list = args.shift();
        list.forEach(handleItems);
        return tlc.apply(this, [list, ...args]);
    });
    const rlc = ForumView.getMethod('replyListChanged');
    ForumView.method('replyListChanged', function (...args) {
        const list = args.shift();
        list.forEach(handleItems);
        return rlc.apply(this, [list, ...args]);
    });
    const gst = ForumModel.getMethod('getSelectedThread');
    ForumModel.method('getSelectedThread', function (...args) {
        const result = gst.apply(this, args);
        handleItems(result);
        return result;
    });
});

whenContentInitialized().then(() => {
    let storedThreads = JSON.parse(localStorage.getItem('ttForumThreads')) || [];
    const injectSearchBar = () => {
        const threadsWrapper = $('#threadsWrapper');
        let searchBar = $('#forumSearchBar');
        if (threadsWrapper.length && !searchBar.length) {
            searchBar = $(`
                <div id="forumSearchBar" style="margin:8px 0; position:relative;">
                    <input type="text" id="forumSearchInput" placeholder="Search...">
                    <div id="forumSearchSuggestions"></div>
                </div>
            `);
            threadsWrapper.before(searchBar);
        }
        searchBar.toggle(threadsWrapper.is(':visible'));
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
                   if (existing.creator !== creator) {
                        existing.creator = creator;
                        changed = true;
                    }
                    if (existing.header !== header) {
                        existing.header = header;
                        changed = true;
                    }
                }
            });
            if (changed) localStorage.setItem('ttForumThreads', JSON.stringify(storedThreads));
        }
        storeThreads();
        const originalThreadListChanged = ForumView.getMethod('threadListChanged');
        ForumView.method('threadListChanged', function (...args) {
            const result = originalThreadListChanged.apply(this, args);
            storeThreads();
            return result;
        });
        const input = $('#forumSearchInput');
        const suggestions = $('#forumSearchSuggestions');
        function performSearch() {
            const query = input.val().toLowerCase().trim();
            if (!query) {
                suggestions.hide();
                return;
            }
            const match = storedThreads.find(t =>
                t.header.toLowerCase().includes(query)
            );
            if (!match) {
                suggestions.hide();
                return;
            }
            window.location.href = `https://tanktrouble.com/forum?threadId=${match.id}`;
            suggestions.hide();
        }
        input.off('input').on('input', function () {
            const query = $(this).val().toLowerCase().trim();
            suggestions.empty();
            if (!query) {
                suggestions.hide();
                return;
            }
            let matches = storedThreads.filter(t =>
                t.creator && t.creator.includes(query)
            );
            if (!matches.length) {
                matches = storedThreads.filter(t => t.header.toLowerCase().includes(query));
            }
            if (!matches.length) {
                suggestions.hide();
                return;
            }
            matches.forEach(thread => {
                const item = $(`<div style="padding:6px; cursor:pointer;">${thread.header}</div>`);
                item.on('click', () => {
                    window.location.href = `https://tanktrouble.com/forum?threadId=${thread.id}`;
                });
                suggestions.append(item);
            });
            suggestions.show();
        });
        input.off('keypress').on('keypress', function (e) {
            if (e.key === 'Enter') performSearch();
        });

        $(document).on('click', function (e) {
            if (!$(e.target).closest('#forumSearchBar').length) {
                suggestions.hide();
            }
        });
    };
    injectSearchBar();
    const observer = new MutationObserver(() => injectSearchBar());
    observer.observe(document.body, { childList: true, subtree: true });
});