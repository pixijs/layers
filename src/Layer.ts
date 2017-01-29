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

        beginWork(stage: Stage) {
            this._activeStageParent = stage;
            this.group.check(stage);
            const groupChildren = this.group._activeChildren;
            for (let i = 0; i < groupChildren.length; i++) {
                groupChildren[i]._activeParentLayer = this;
                this._activeChildren.push(groupChildren[i]);
            }
            groupChildren.length = 0;
        }

        endWork() {
        }

        updateDisplayLayers() {

        }

        static compareZIndex(a: DisplayObject, b: DisplayObject) {
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex;
            }
            if (a.zOrder > b.zOrder) {
                return 1;
            }
            if (a.zOrder < b.zOrder) {
                return -1;
            }
            return a.updateOrder - b.updateOrder;
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

            if (this.children !== this._activeChildren &&
                this._tempChildren != this.children) {
                this._tempChildren = this.children;
            }

            //just a temporary feature - getBounds() for filters will work with that
            //TODO: make a better hack for getBounds()

            this._boundsID++;
            this.children = this._activeChildren;
            return true;
        }

        _postRender(renderer: WebGLRenderer | CanvasRenderer) {
            this.children = this._tempChildren;
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
