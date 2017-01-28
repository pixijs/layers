/// <reference types="pixi.js" />

declare module PIXI {
    interface WebGLRenderer {
        _lastDisplayOrder: number
        incDisplayOrder(): number
    }
    interface CanvasRenderer {
        _lastDisplayOrder: number
        incDisplayOrder(): number
    }
}

(Object as any).assign(WebGLRenderer.prototype, {
    _lastDisplayOrder: 0,

    incDisplayOrder() {
        return ++this._lastDisplayOrder;
    },

    _oldRender: WebGLRenderer.prototype.render,

    render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
});

(Object as any).assign(CanvasRenderer.prototype, {
    _lastDisplayOrder: 0,

    incDisplayOrder() {
        return ++this._lastDisplayOrder;
    },

    _oldRender: CanvasRenderer.prototype.render,

    render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
        if (!renderTexture) {
            this._lastDisplayOrder = 0;
        }
        this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
    }
});
