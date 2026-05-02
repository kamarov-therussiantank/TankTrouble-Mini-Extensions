UITankIcon.classMethod('loadPlayerTankIcon', function (canvas, size, playerId, onReady, context) {
    Backend.getInstance().getPlayerDetails(function (result) {
        if (typeof result === 'object') {
            const gmLevel = result.getGmLevel();
            const username = result.getUsername();
            const turretColour = result.getTurretColour();
            const treadColour = result.getTreadColour();
            const baseColour = result.getBaseColour();
            const turretAccessory = result.getTurretAccessory();
            const barrelAccessory = result.getBarrelAccessory();
            const frontAccessory = result.getFrontAccessory();
            const backAccessory = result.getBackAccessory();
            const isComplete = (
                turretColour && treadColour && baseColour &&
                turretAccessory && barrelAccessory &&
                frontAccessory && backAccessory
            );
            if (!isComplete) return;
            Backend.getInstance().ajax.getBackers(backerResult => {
                const backers = backerResult.result.data;
                const admin = gmLevel >= 1;
                const kickstarter = backers.includes(username);
                let badge = null;
                    if (kickstarter && admin) {
                        badge = '1';
                    } else if (kickstarter) {
                        badge = '2';
                    } else if (admin) {
                        badge = '1';
                    }
                UITankIcon.loadTankIcon(
                    canvas,
                    size,
                    turretColour,
                    treadColour,
                    baseColour,
                    turretAccessory,
                    barrelAccessory,
                    frontAccessory,
                    backAccessory,
                    null,
                    null,
                    badge,
                    onReady || function () {},
                    context || self
                );
            });
        } else {
            UITankIcon.loadTankIcon(
                canvas,
                size,
                UIConstants.TANK_UNAVAILABLE_COLOUR,
                UIConstants.TANK_UNAVAILABLE_COLOUR,
                UIConstants.TANK_UNAVAILABLE_COLOUR,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                onReady || function () {},
                context || self
            );
        }
    }, function () {}, function () {}, playerId, Caches.getPlayerDetailsCache());
});
UITankIconLoader.method('queueAccessory', function (part, accessory) {
    if (
        accessory !== null &&
        accessory !== undefined &&
        accessory !== '0'
    ) {
        this._queueImage(
            'accessories/',
            part,
            accessory,
            this.accessories,
            part,
            true
        );
    }
});
UITankIconLoader.method('_queueImage', function (
    basePath,
    part,
    image,
    output,
    customKey
) {
    const key = customKey !== undefined ? customKey : part;
    const cacheKey = part + image + '-' + this.size;
    let cachedImage = UITankIconLoader.imageCache[cacheKey];
    if (cachedImage === undefined) {
        const resolution = UIConstants.TANK_ICON_RESOLUTIONS[this.size];
        let imgPath = basePath + part + image + '-' + resolution;
        let imageName = imgPath.includes('assets')
            ? imgPath.substring(14)
            : imgPath;
        const d_url = (path) => path;
        const isBadge = part === UIConstants.TANK_ICON_ACCESSORY_PARTS.BADGE;
        let src, srcset;
        if (isBadge) {
            src =
                'https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/' +
                imageName +
                '.png';
            srcset =
                'https://raw.githubusercontent.com/kamarov-therussiantank/TankTrouble-Mini-Extensions/refs/heads/main/uiadditions%26improvements/src/assets/images/' +
                imageName +
                '@2x.png 2x';
        } else {
            src = g_url('assets/images/' + imageName + '.png');
            srcset = g_url('assets/images/' + imageName + '@2x.png') + ' 2x';
        }
        const imageElement = $('<img>', {
            src: src,
            srcset: srcset,
            crossorigin: 'anonymous'
        });
        const self = this;
        imageElement.on('load', function () {
            UITankIconLoader.imageCache[cacheKey] = this;
            output[key] = this;
            ++self.numImagesLoaded;
            self._checkIfDone();
        });
        imageElement.on('error', function () {
            const fallback = $('<img>', {
                src: g_url('assets/images/' + imageName + '.png'),
                srcset:
                    g_url('assets/images/' + imageName + '@2x.png') + ' 2x',
                crossorigin: 'anonymous'
            });
            fallback.on('load', function () {
                UITankIconLoader.imageCache[cacheKey] = this;
                output[key] = this;
                ++self.numImagesLoaded;
                self._checkIfDone();

            });
            fallback.on('error', function () {
                ++self.numImagesLoaded;
                self._checkIfDone();
            });
        });
    } else {
        output[key] = cachedImage;
        ++this.numImagesLoaded;
    }
    ++this.numImages;
});