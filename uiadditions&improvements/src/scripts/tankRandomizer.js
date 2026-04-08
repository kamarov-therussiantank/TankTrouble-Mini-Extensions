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

(() => {
    let id = null;
    let turret = [], back = [], barrel = [], front = [], treads = [], colours = [];
    let currentTankIcon = null;

    function getRandomColorFromGarage() {
        return colours[Math.floor(Math.random() * colours.length)];
    }

    function randomizeAccessory(partArray, partName) {
        const newAccessory = partArray[Math.floor(Math.random() * partArray.length)];
        Backend.getInstance().setAccessory(() => Users.updateUser(id, true, false), null, null,
            id, partName, newAccessory, Caches.getPlayerDetailsCache());
        if (currentTankIcon) currentTankIcon.updateIcon();
    }

    function randomizePaint(partName) {
        const newColour = getRandomColorFromGarage();
        Backend.getInstance().setColour(() => Users.updateUser(id, true, false), null, null,
            id, partName, newColour, Caches.getPlayerDetailsCache());
        if (currentTankIcon) currentTankIcon.updateIcon();
    }

    function randomizeAllAccessories() {
        randomizeAccessory(front, 'front');
        randomizeAccessory(back, 'back');
        randomizeAccessory(turret, 'turret');
        randomizeAccessory(barrel, 'barrel');
    }

    function randomizeAllPaints() {
        randomizePaint('turret');
        randomizePaint('base');
        randomizePaint('tread');
    }

    let ui = null;

    Loader.interceptFunction(TankTrouble.GarageOverlay, '_initialize', (original, ...args) => {
        original(...args);

        ui = $(`<div id="tank-randomizer-UI"></div>`);

        const accessoryText = $('<div class="partTexts">Accessories</div>');
        const paintText = $('<div class="partTexts">Paints</div>');

        const accessoryPartSelect = $("<select class='partSelectAccessory'></select>");
        const paintPartSelect = $("<select class='partSelectPaint'></select>");

        accessoryPartSelect.append(`<option value="allAccessories">All</option>`);
        accessoryPartSelect.append(`<option value="barrelAccessory">Barrel</option>`);
        accessoryPartSelect.append(`<option value="turretAccessory">Turret</option>`);
        accessoryPartSelect.append(`<option value="frontAccessory">Front</option>`);
        accessoryPartSelect.append(`<option value="backAccessory">Back</option>`);

        paintPartSelect.append(`<option value="allPaints">All</option>`);
        paintPartSelect.append(`<option value="turretPaints">Turret</option>`);
        paintPartSelect.append(`<option value="basePaints">Base</option>`);
        paintPartSelect.append(`<option value="treadsPaints">Treads</option>`);

        const buttons = {
            accessoriesButton: $('<button class="randomize-button button">Randomize</button>'),
            barrelAccessoryButton: $('<button class="randomize-button button">Randomize</button>'),
            turretAccessoryButton: $('<button class="randomize-button button">Randomize</button>'),
            frontAccessoryButton: $('<button class="randomize-button button">Randomize</button>'),
            backAccessoryButton: $('<button class="randomize-button button">Randomize</button>'),
            paintButton: $('<button class="randomize-button button">Randomize</button>'),
            turretPaintButton: $('<button class="randomize-button button">Randomize</button>'),
            basePaintButton: $('<button class="randomize-button button">Randomize</button>'),
            treadsPaintButton: $('<button class="randomize-button button">Randomize</button>')
        };

        // Button events
        buttons.accessoriesButton.on('mouseup', randomizeAllAccessories);
        buttons.barrelAccessoryButton.on('mouseup', () => randomizeAccessory(barrel, 'barrel'));
        buttons.turretAccessoryButton.on('mouseup', () => randomizeAccessory(turret, 'turret'));
        buttons.frontAccessoryButton.on('mouseup', () => randomizeAccessory(front, 'front'));
        buttons.backAccessoryButton.on('mouseup', () => randomizeAccessory(back, 'back'));

        buttons.paintButton.on('mouseup', randomizeAllPaints);
        buttons.turretPaintButton.on('mouseup', () => randomizePaint('turret'));
        buttons.basePaintButton.on('mouseup', () => randomizePaint('base'));
        buttons.treadsPaintButton.on('mouseup', () => randomizePaint('tread'));

        function toggleButtons() {
            const accessoryValue = accessoryPartSelect.val();
            const paintValue = paintPartSelect.val();

            Object.values(buttons).forEach(b => b.hide());

            if (accessoryValue === "allAccessories") buttons.accessoriesButton.show();
            else if (accessoryValue === "barrelAccessory") buttons.barrelAccessoryButton.show();
            else if (accessoryValue === "turretAccessory") buttons.turretAccessoryButton.show();
            else if (accessoryValue === "frontAccessory") buttons.frontAccessoryButton.show();
            else if (accessoryValue === "backAccessory") buttons.backAccessoryButton.show();

            if (paintValue === "allPaints") buttons.paintButton.show();
            else if (paintValue === "turretPaints") buttons.turretPaintButton.show();
            else if (paintValue === "basePaints") buttons.basePaintButton.show();
            else if (paintValue === "treadsPaints") buttons.treadsPaintButton.show();
        }

        accessoryPartSelect.on('change', toggleButtons);
        paintPartSelect.on('change', toggleButtons);

        const rows = $('<div class="randomizer-rows"></div>');
        const accessoriesRow = $('<div class="accessory-randomizer-row"></div>');
        const paintsRow = $('<div class="paint-randomizer-row"></div>');

        const accessoryContainer = $('<div class="part-container"></div>');
            accessoryContainer.append(accessoryText, accessoryPartSelect, 
            buttons.accessoriesButton, buttons.barrelAccessoryButton, buttons.turretAccessoryButton,
            buttons.frontAccessoryButton, buttons.backAccessoryButton);

        const paintContainer = $('<div class="part-container"></div>');
            paintContainer.append(paintText, paintPartSelect, 
            buttons.paintButton, buttons.turretPaintButton, buttons.basePaintButton, buttons.treadsPaintButton);

        rows.append(accessoriesRow, paintsRow);
        accessoriesRow.append(accessoryContainer);
        paintsRow.append(paintContainer);
        ui.append(rows);

        toggleButtons();
    });

    Loader.interceptFunction(TankTrouble.GarageOverlay, 'show', (original, ...args) => {
        original(...args);

        id = TankTrouble.GarageOverlay.getPlayerId();

        turret.length = back.length = barrel.length = front.length = treads.length = colours.length = 0;

        // Inject UI under phaser if not already
        setTimeout(() => {
            if (!$('#tank-randomizer-UI').length && $('.garage .phaser').length) {
                $('.garage .phaser').after(ui);
                console.log('%c[Randomizer] UI injected under .phaser', 'color:lime;');
            }
        }, 50);

        // Load garage content
        Backend.getInstance().getGarageContent(result => {
            const boxes = result['boxes'];

            for (const box in boxes) {
                const accessories = boxes[box]['accessories'];
                const sprays = boxes[box]['sprayCans'];

                for (const accessory in accessories) {
                    const item = accessories[accessory];
                    if (item['type'] === 'front') front.push(item['value']);
                    if (item['type'] === 'back') back.push(item['value']);
                    if (item['type'] === 'tread') treads.push(item['value']);
                    if (item['type'] === 'barrel') barrel.push(item['value']);
                    if (item['type'] === 'turret') turret.push(item['value']);
                }

                for (const spray in sprays) {
                    const color = sprays[spray]['colour'];
                    if (color['type']) colours.push(color['rawValue']);
                }
            }

            // Update the currentTankIcon reference
            if (TankTrouble.GarageOverlay._currentTankIconImage) {
                currentTankIcon = TankTrouble.GarageOverlay._currentTankIconImage;
            }
        }, () => {}, () => {}, id, Caches.getGarageContentCache());
    });

})();
