/**
 * Created by ivanp on 29.01.2017.
 */

module pixi_display {
    import Container = PIXI.Container;
    import WebGLRenderer = PIXI.WebGLRenderer;
    import CanvasRenderer = PIXI.CanvasRenderer;
    import DisplayObject = PIXI.DisplayObject;
    export class Layer extends Container {
        constructor(group: Group = null) {
            super();
            if (group != null) {
                this.group = group;
                this.zIndex = group.zIndex;
            } else {
                this.group = new Group(0, false);
            }
            this._tempChildren = this.children;
        }

        isLayer = true;
        group: Group = null;
        _activeChildren: Array<DisplayObject> = [];
        _tempChildren: Array<DisplayObject> = null;
        _activeStageParent: Stage = null;
        _sortedChildren: Array<DisplayObject> = [];
        _tempLayerParent : Layer = null;

        insertChildrenBeforeActive = true;
        insertChildrenAfterActive = true;

        beginWork(stage: Stage) {
            const active = this._activeChildren;
            this._activeStageParent = stage;
            this.group.foundLayer(stage, this);
            const groupChildren = this.group._activeChildren;
            active.length = 0;
            for (let i = 0; i < groupChildren.length; i++) {
                groupChildren[i]._activeParentLayer = this;
                active.push(groupChildren[i]);
            }
            groupChildren.length = 0;
        }

        endWork() {
            const children = this.children;
            const active = this._activeChildren;
            const sorted = this._sortedChildren;

            for (let i = 0; i < active.length; i++) {
                this.emit("display", active[i])
            }

            sorted.length = 0;
            if (this.insertChildrenBeforeActive) {
                for (let i = 0; i < children.length; i++) {
                    sorted.push(children[i]);
                }
            }
            for (let i = 0; i < active.length; i++) {
                sorted.push(active[i]);
            }
            if (!this.insertChildrenBeforeActive &&
                this.insertChildrenAfterActive) {
                for (let i = 0; i < children.length; i++) {
                    sorted.push(children[i]);
                }
            }

            if (this.group.enableSort) {
                this.doSort();
            }
        }

        updateDisplayLayers() {

        }

        /**
         * you can override this method for this particular layer, if you want
         */
        doSort() {
            this.group.doSort(this, this._sortedChildren);
        }

        _preRender(renderer: WebGLRenderer | CanvasRenderer): boolean {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return false;
            }

            if (!this.visible) {
                this.displayOrder = 0;
                return false;
            }

            this.displayOrder = renderer.incDisplayOrder();

            // if the object is not visible or the alpha is 0 then no need to render this element
            if (this.worldAlpha <= 0 || !this.renderable) {
                return false;
            }

            // we are making a hack with swapping children, it can go wrong easily
            // this is special "recover" if that allows stage to recover just after failed frame

            if (this.children !== this._sortedChildren &&
                this._tempChildren != this.children) {
                this._tempChildren = this.children;
            }

            //just a temporary feature - getBounds() for filters will work with that
            //TODO: make a better hack for getBounds()

            this._boundsID++;
            this.children = this._sortedChildren;

            this._tempLayerParent = renderer._activeLayer;
            renderer._activeLayer = this;
            return true;
        }

        _postRender(renderer: WebGLRenderer | CanvasRenderer) {
            this.children = this._tempChildren;
            renderer._activeLayer = this._tempLayerParent;
            this._tempLayerParent = null;
        }

        renderWebGL(renderer: WebGLRenderer) {
            if (this._preRender(renderer)) {
                this.containerRenderWebGL(renderer);
                this._postRender(renderer);
            }
        }

        renderCanvas(renderer: CanvasRenderer) {
            if (this._preRender(renderer)) {
                this.containerRenderCanvas(renderer);
                this._postRender(renderer);
            }
        }
    }
}
