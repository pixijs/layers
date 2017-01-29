/// <reference types="pixi.js" />

declare module PIXI {
    import Layer = pixi_display.Layer;
    interface WebGLRenderer {
        _activeLayer: Layer
        _renderSessionId: number
        _lastDisplayOrder: number
        incDisplayOrder(): number
    }
    interface CanvasRenderer {
        _activeLayer: Layer
        _renderSessionId: number
        _lastDisplayOrder: number
        incDisplayOrder(): number
    }
}

module pixi_display {
    import WebGLRenderer = PIXI.WebGLRenderer;
    import CanvasRenderer = PIXI.CanvasRenderer;
    import DisplayObject = PIXI.DisplayObject;
    import Transform = PIXI.Transform;
    import RenderTexture = PIXI.RenderTexture;

    (Object as any).assign(WebGLRenderer.prototype, {
        _lastDisplayOrder: 0,
        _renderSessionId: 0,
        _activeLayer: null,

        incDisplayOrder() {
            return ++this._lastDisplayOrder;
        },

        _oldRender: WebGLRenderer.prototype.render,

        render(displayObject: DisplayObject, renderTexture?: RenderTexture, clear?: boolean, transform?: Transform, skipUpdateTransform?: boolean) {
            if (!renderTexture) {
                this._lastDisplayOrder = 0;
            }
            this._activeLayer = null;
            this._renderSessionId++;
            this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
        }
    });

    (Object as any).assign(CanvasRenderer.prototype, {
        _lastDisplayOrder: 0,
        _renderSessionId: 0,
        _activeLayer: null,

        incDisplayOrder() {
            return ++this._lastDisplayOrder;
        },

        _oldRender: CanvasRenderer.prototype.render,

        render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
            if (!renderTexture) {
                this._lastDisplayOrder = 0;
            }
            this._activeLayer = null;
            this._renderSessionId++;
            this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
        }
    });
}
