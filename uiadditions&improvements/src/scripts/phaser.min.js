// Phaser image rendering
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
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    if (REMOVE_SHADING) {
        pC(ctx, canvas.width, canvas.height, POSTERIZE_LEVELS);
    }
    return canvas;
}
async function pT(game) {
    if (!game || !game.cache || !game.cache._cache?.image) return;
    const images = game.cache._cache.image;
    const SCALE_MODE =
        (typeof PIXI !== "undefined" && PIXI.SCALE_MODES?.LINEAR) ||
        (typeof PIXI !== "undefined" && PIXI.scaleModes?.LINEAR) ||
        0;
    for (let key in images) {
        const imgData = images[key];
        if (!imgData || !imgData.base || !imgData.base.source) continue;
        if (imgData._sharpProcessed) continue;
        try {
            const original = imgData.base.source;
            if (!(original instanceof HTMLImageElement || original instanceof HTMLCanvasElement)) {
                continue;
            }
            const canvas = await pI(original);
            if (!canvas) continue;
            const newBase = new PIXI.BaseTexture(canvas);
            newBase.scaleMode = SCALE_MODE;
            imgData.base = newBase;
            if (imgData.texture) {
                imgData.texture.baseTexture = newBase;
                imgData.texture.frame = new PIXI.Rectangle(0, 0, canvas.width, canvas.height);
            }
            imgData._sharpProcessed = true;
        } catch (e) {
            console.warn("Failed processing:", key, e);
        }
    }
}
function fR(game) {
    if (game.renderer?.renderSession) {
        game.renderer.renderSession.roundPixels = false;
    }
}
let lastGame = null;
let lastCache = null;
setInterval(() => {
    const game = GameManager?.getGame?.();
    if (!game) return;
    if (game !== lastGame) {
        lastGame = game;
        lastCache = null;
        fR(game);
        pT(game);
        return;
    }
    const currentCache = game.cache?._cache?.image;
    if (currentCache && currentCache !== lastCache) {
        lastCache = currentCache;
        fR(game);
        pT(game);
    }
}, 1000);