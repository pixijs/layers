/**
 * @mixin
 */
var WebGLRendererMixin = {
    _oldRender: PIXI.WebGLRenderer.prototype.render,
    render: function (displayObject, renderTexture, clear, transform, skipUpdateTransform) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
};

module.exports = WebGLRendererMixin;
