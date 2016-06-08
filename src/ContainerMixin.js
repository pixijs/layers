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

        //this code is copied from Container.renderCanvas

        if (this._mask) {
            renderer.maskManager.pushMask(this._mask, renderer);
        }

        this._renderCanvas(renderer);
        for (var i = 0, j = this.children.length; i < j; ++i) {
            this.children[i].renderCanvas(renderer);
        }

        if (this._mask) {
            renderer.maskManager.popMask(renderer);
        }
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

        //this code is copied from Container.renderWebGL
        var i, j;

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || this._filters) {
            renderer.currentRenderer.flush();

            // push filter first as we need to ensure the stencil buffer is correct for any masking
            if (this._filters && this._filters.length) {
                renderer.filterManager.pushFilter(this, this._filters);
            }

            if (this._mask) {
                renderer.maskManager.pushMask(this, this._mask);
            }

            renderer.currentRenderer.start();

            // add this object to the batch, only rendered if it has a texture.
            this._renderWebGL(renderer);

            // now loop through the children and make sure they get rendered
            for (i = 0, j = this.children.length; i < j; i++) {
                this.children[i].renderWebGL(renderer);
            }

            renderer.currentRenderer.flush();

            if (this._mask) {
                renderer.maskManager.popMask(this, this._mask);
            }

            if (this._filters) {
                renderer.filterManager.popFilter();

            }
            renderer.currentRenderer.start();
        }
        else {
            this._renderWebGL(renderer);

            // simple render children!
            for (i = 0, j = this.children.length; i < j; ++i) {
                this.children[i].renderWebGL(renderer);
            }
        }
    }
};

module.exports = ContainerMixin;
