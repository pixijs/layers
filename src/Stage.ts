module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;
    import WebGLRenderer = PIXI.WebGLRenderer;
    import DestroyOptions = PIXI.DestroyOptions;
    /**
     * Container for layers
     *
     */
    export class Stage extends Layer {
        constructor() {
            super();
        }

        static _updateOrderCounter: number = 0;

        isStage = true;

        _tempGroups: Array<DisplayObject> = [];

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
            this._tempGroups.length = 0;
        }

        destroy(options?: DestroyOptions | boolean) {
            this.clear();
            super.destroy(options);
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
                layer.beginWork(this);
            }

            if (displayObject != this && (displayObject as Stage).isStage) {
                const stage = displayObject as Stage;
                stage.updateAsChildStage(this);
                return;
            }

            const group = displayObject.parentGroup;
            if (group != null) {
                displayObject.parentGroup.addDisplayObject(this, displayObject);
            }
            const layer = displayObject.parentLayer;
            if (layer != null) {
                layer.group.addDisplayObject(this, displayObject);
            }

            displayObject.updateOrder = ++Stage._updateOrderCounter;
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
            Stage._updateOrderCounter = 0;
            this._updateStageInner();
        }

        updateStage() {
            this._activeParentStage = null;
            Group._layerUpdateId++;
            this._updateStageInner();
        };
    }
}
