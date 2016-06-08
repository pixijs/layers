/**
 * @mixin
 */
var CanvasRendererMixin = {
    _oldRender: PIXI.CanvasRenderer.prototype.render,
    render: function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
};

module.exports = CanvasRendererMixin;
