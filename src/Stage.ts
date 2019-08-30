namespace pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;

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

        destroy(options?: any) {
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

            if ((displayObject as any).isLayer) {
                const layer = displayObject as any as Layer;
                this._activeLayers.push(layer);
                layer.beginWork(this);
            }

            if (displayObject != this && (displayObject as any).isStage) {
                const stage = displayObject as Stage;
                stage.updateAsChildStage(this);
                return;
            }

            // sometimes people put UNDEFINED in parentGroup or parentLayer
            // that's why there is != instead of !==

            let group = displayObject.parentGroup;
            if (group != null) {
                group.addDisplayObject(this, displayObject);
            }
            const layer = displayObject.parentLayer;
            if (layer != null) {
                group = layer.group;
                group.addDisplayObject(this, displayObject);
            }

            displayObject.updateOrder = ++Stage._updateOrderCounter;
            if (displayObject.alpha <= 0 || !displayObject.renderable
                || !displayObject.layerableChildren
                || group && group.sortPriority) {
                return;
            }

            const children = (displayObject as Container).children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++) {
                    this._addRecursive(children[i]);
                }
            }
        }

        _addRecursiveChildren(displayObject: DisplayObject) {
            if (displayObject.alpha <= 0 || !displayObject.renderable
                || !displayObject.layerableChildren) {
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
                const layer = layers[i];
                if (layer.group.sortPriority) {
                    layer.endWork();
                    const sorted = layer._sortedChildren;
                    for (let j = 0; j < sorted.length; j++) {
                        this._addRecursiveChildren(sorted[j]);
                    }
                }
            }

            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (!layer.group.sortPriority) {
                    layer.endWork();
                }
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
