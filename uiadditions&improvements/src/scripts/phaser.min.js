//
const REMOVE_SHADING = false;
const POSTERIZE_LEVELS = 3;
const ogc = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function(type, opts) {
    const ctx = ogc.call(this, type, opts);
    if (type === "2d" && ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.mozImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
    }
    return ctx;
};
function pC(ctx, width, height, levels = 3) {
    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i]     = Math.round(data[i] / 255 * levels) * (255 / levels);
        data[i + 1] = Math.round(data[i + 1] / 255 * levels) * (255 / levels);
        data[i + 2] = Math.round(data[i + 2] / 255 * levels) * (255 / levels);
    }
    ctx.putImageData(img, 0, 0);
}
async function pI(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    if (REMOVE_SHADING) {
        pC(ctx, canvas.width, canvas.height, POSTERIZE_LEVELS);
    }
    return canvas;
}
async function s(game) {
    if (!game || !game.cache || !game.cache._cache?.image) return;
    const images = game.cache._cache.image;
    for (let key in images) {
        const imgData = images[key];
        if (!imgData || !imgData.base || !imgData.base.source) continue;
        try {
            const original = imgData.base.source;
            const canvas = await pI(original);
            const newBase = new PIXI.BaseTexture(canvas);
            newBase.scaleMode = PIXI.SCALE_MODES.NEAREST;
            if (imgData.base._frame) {
                newBase._frame = imgData.base._frame.clone();
            }
            imgData.base = newBase;
            if (imgData.texture) {
                imgData.texture.baseTexture = newBase;
                imgData.texture.frame = new PIXI.Rectangle(0, 0, canvas.width, canvas.height);
            }

        } catch (e) {
            console.warn("Failed processing:", key, e);
        }
    }
}
function sM() {
    const game = GameManager?.getGame?.();
    if (!game) {
        console.warn("Game is not defined");
        return;
    }
    if (game.renderer?.renderSession) {
        game.renderer.renderSession.roundPixels = false;
    }
    s(game);
}
const waitForGame = setInterval(() => {
    if (typeof GameManager !== "undefined" && GameManager.getGame()) {
        clearInterval(waitForGame);
        sM();
    }
}, 500);