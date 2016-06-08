/**
 * @mixin
 */
var ContainerMixin = {
    /**
     * @type {PIXI.DisplayList}
     */
    displayList: null,

    /**
     * calculated display children in last
     * @type {PIXI.DisplayObject[]}
     */
    displayChildren: null,

    updateTransform: function () {
        if (!this.visible) {
            return;
        }
        this.containerUpdateTransform();
        if (this.displayList) {
            this.displayList.update(this);
        }
    },

    /**
     * Renders the object using the Canvas renderer
     *
     * @param renderer {PIXI.CanvasRenderer} The renderer
     */
    renderCanvas: function (renderer) {
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

    /**
     * Renders the object using the WebGL renderer
     *
     * @param renderer {PIXI.WebGLRenderer} The renderer
     */
    renderWebGL: function (renderer) {
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
};

module.exports = ContainerMixin;
