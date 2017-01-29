
declare module PIXI {
    export interface Container {
        containerRenderWebGL(renderer: WebGLRenderer): void;
        containerRenderCanvas(renderer: CanvasRenderer): void;
    }
}

module pixi_display {
    import WebGLRenderer = PIXI.WebGLRenderer;
    import CanvasRenderer = PIXI.CanvasRenderer;
    import Container = PIXI.Container;

    (Object as any).assign(Container.prototype, {
        renderWebGL: function (renderer: WebGLRenderer): void {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return;
            }

            if (!this.visible) {
                this.displayOrder = 0;
                return;
            }

            this.displayOrder = renderer.incDisplayOrder();

            // if the object is not visible or the alpha is 0 then no need to render this element
            if (this.worldAlpha <= 0 || !this.renderable) {
                return;
            }

            this.containerRenderWebGL(renderer);
        },
        renderCanvas: function (renderer: CanvasRenderer): void {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return;
            }

            if (!this.visible) {
                this.displayOrder = 0;
                return;
            }

            this.displayOrder = renderer.incDisplayOrder();

            // if the object is not visible or the alpha is 0 then no need to render this element
            if (this.worldAlpha <= 0 || !this.renderable) {
                return;
            }

            this.containerRenderCanvas(renderer);
        },
        containerRenderWebGL: PIXI.Container.prototype.renderWebGL,
        containerRenderCanvas: PIXI.Container.prototype.renderCanvas
    });
}