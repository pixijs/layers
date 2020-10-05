// Fix issue #60: https://github.com/pixijs/pixi-layers/issues/60

declare namespace PIXI {
    export interface ParticleContainer {
        particleContainerRenderWebGL?(renderer: Renderer): void;
    }
}

namespace pixi_display {
    (Object as any).assign(PIXI.ParticleContainer.prototype, {
        render: function (renderer: PIXI.Renderer): void {
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

            renderer._activeLayer = null;
            this.particleContainerRenderWebGL(renderer);
            renderer._activeLayer = this._activeParentLayer;
        },
        renderCanvas: function (renderer: PIXI.CanvasRenderer): void {
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

            renderer._activeLayer = null;
            this.particleContainerRenderCanvas(renderer);
            renderer._activeLayer = this._activeParentLayer;
        },
        particleContainerRenderWebGL: PIXI.ParticleContainer.prototype.render,
        particleContainerRenderCanvas: (PIXI.ParticleContainer as any).prototype.renderCanvas
    });
}