declare namespace PIXI {
    interface Renderer {
        _activeLayer?: pixi_display.Layer
        _renderSessionId?: number
        _lastDisplayOrder?: number
        CONTEXT_UID?: number
        incDisplayOrder?(): number
    }
    interface CanvasRenderer {
        _activeLayer?: pixi_display.Layer
        _renderSessionId?: number
        _lastDisplayOrder?: number
        incDisplayOrder?(): number
    }
}

namespace pixi_display {
    (Object as any).assign(PIXI.Renderer.prototype, {
        _lastDisplayOrder: 0,
        _activeLayer: null,

        incDisplayOrder() {
            return ++this._lastDisplayOrder;
        },

        _oldRender: PIXI.Renderer.prototype.render,

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

    let canvasRenderer = (PIXI as any).CanvasRenderer;
    if (canvasRenderer) {
        (Object as any).assign(canvasRenderer.prototype, {
            _lastDisplayOrder: 0,
            _activeLayer: null,

            incDisplayOrder() {
                return ++this._lastDisplayOrder;
            },

            _oldRender: canvasRenderer.prototype.render,

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
}
