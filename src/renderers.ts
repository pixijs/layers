/// <reference types="pixi.js" />

declare namespace PIXI {
    interface WebGLRenderer {
        _activeLayer: pixi_display.Layer
        _renderSessionId: number
        _lastDisplayOrder: number
        incDisplayOrder(): number
    }
    interface CanvasRenderer {
        _activeLayer: pixi_display.Layer
        _renderSessionId: number
        _lastDisplayOrder: number
        incDisplayOrder(): number
    }
}

namespace pixi_display {
    (Object as any).assign(PIXI.WebGLRenderer.prototype, {
        _lastDisplayOrder: 0,
        _activeLayer: null,

        incDisplayOrder() {
            return ++this._lastDisplayOrder;
        },

        _oldRender: PIXI.WebGLRenderer.prototype.render,

        render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
            if (!renderTexture) {
                this._lastDisplayOrder = 0;
            }
            this._activeLayer = null;
            if ((displayObject as Stage).isStage) {
                (displayObject as Stage).updateStage()
            }
            this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
        }
    });

    (Object as any).assign(PIXI.CanvasRenderer.prototype, {
        _lastDisplayOrder: 0,
        _activeLayer: null,

        incDisplayOrder() {
            return ++this._lastDisplayOrder;
        },

        _oldRender: PIXI.CanvasRenderer.prototype.render,

        render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
            if (!renderTexture) {
                this._lastDisplayOrder = 0;
            }
            this._activeLayer = null;
            if ((displayObject as Stage).isStage) {
                (displayObject as Stage).updateStage()
            }
            this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
        }
    });
}
