import WebGLRenderer = PIXI.WebGLRenderer;
import CanvasRenderer = PIXI.CanvasRenderer;
declare module PIXI {
    export interface Container {
        displayList: pixi_display.DisplayList;
        displayChildren: Array<PIXI.DisplayObject>;
        updateTransform(): void;
        renderCanvas(renderer: CanvasRenderer): void;
        renderWebGL(renderer: WebGLRenderer): void;
        containerRenderWebGL(renderer: WebGLRenderer): void;
        containerRenderCanvas(renderer: CanvasRenderer): void;
    }
}

(Object as any).assign(PIXI.Container.prototype, {
    displayList: null,
    displayChildren: null,
    displayParent: null,
    updateTransform: function () {
        if (!this.visible) {
            return;
        }
        this.containerUpdateTransform();
        if (this.displayList) {
            this.displayList.update(this);
        }
    },
    renderCanvas: function (renderer: CanvasRenderer) {
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }

        this.displayOrder = renderer.incDisplayOrder();

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        //hook for displayList

        if (this.displayList) {
            this.displayList.renderCanvas(this, renderer);
            return;
        }

        this.containerRenderCanvas(renderer);
    },
    renderWebGL: function (renderer: WebGLRenderer) {
        if (!this.visible) {
            this.displayOrder = 0;
            return;
        }

        this.displayOrder = renderer.incDisplayOrder();

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (this.worldAlpha <= 0 || !this.renderable) {
            return;
        }

        //hook for displayList

        if (this.displayList) {
            this.displayList.renderWebGL(this, renderer);
            return;
        }

        this.containerRenderWebGL(renderer);
    },
    containerRenderWebGL: PIXI.Container.prototype.renderWebGL,
    containerRenderCanvas: PIXI.Container.prototype.renderCanvas
});
