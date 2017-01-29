module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;
    import WebGLRenderer = PIXI.WebGLRenderer;
    /**
     * Container for layers
     *
     */
    export class Stage extends Layer {
        constructor() {
            super();
        }

        isStage = true;
        /**
         * Found layers
         */
        _activeLayers: Array<Layer> = [];

        _activeParentStage: Stage = null;

        /**
         * clears all display lists that were used in last rendering session
         * please clear it when you stop using this displayList, otherwise you may have problems with GC in some cases
         */
        clear() {
            this._activeLayers.length = 0;
        }

        /**
         * alias for clear()
         * please call it if you stop using this displayList
         */
        destroy() {
            this.clear();
        }

        /**
         *
         * @param displayObject {PIXI.DisplayObject} container that we are adding to Stage
         * @private
         */
        _addRecursive(displayObject: DisplayObject) {
            if (!displayObject.visible) {
                return;
            }

            if ((displayObject as Layer).isLayer) {
                const layer = displayObject as Layer;
                this._activeLayers.push(layer);
                layer.beginWork();
            }

            if (displayObject != this && (displayObject as Stage).isStage) {
                const stage = displayObject as Stage;
                stage.updateAsChildStage(this);
                return;
            }

            if (displayObject.parentGroup != null) {
                displayObject.parentGroup.addDisplayObject(this, displayObject);
            }

            if (displayObject.alpha <= 0 || !displayObject.renderable || !displayObject.layerableChildren) {
                return;
            }

            const children = (displayObject as Container).children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++) {
                    this._addRecursive(children[i]);
                }
            }
        }

        _updateStageInner() {
            this.clear();
            this._addRecursive(this);
            const layers = this._activeLayers;
            for (let i = 0; i < layers.length; i++) {
                layers[i].endWork();
            }
        }

        updateAsChildStage(stage: Stage) {
            this._activeParentStage = stage;
            this._updateStageInner();
        }

        updateStage() {
            this._activeParentStage = null;
            Group._layerUpdateId++;
            this._updateStageInner();
        };
    }
}
