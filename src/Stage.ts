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

        /**
         * clears all display lists that were used in last rendering session
         * please clear it when you stop using this displayList, otherwise you may have problems with GC in some cases
         */
        clear() {
            this._activeLayers.length = 0;
        };

        /**
         * alias for clear()
         * please call it if you stop using this displayList
         */
        destroy() {
            this.clear();
        };

        /**
         *
         * @param displayObject {PIXI.DisplayObject} container that we are adding to Stage
         * @private
         */
        _addRecursive(displayObject: DisplayObject) {
            if ((displayObject as Layer).isLayer) {

            }

            var container = displayObject as Container;
            if (!container.visible || !container.renderable) {
                return;
            }
            var groups = this.displayGroups;
            var group = parent.displayGroup;

            container.updateOrder = this.totalElements++;
            if (container.displayGroup) {
                group = container.displayGroup;
                if (!group.currentDisplayList) {
                    group.currentDisplayList = this;
                    group.currentIndex = groups.length;
                    groups.push(group);
                }
                group.add(container);

                container.displayParent = container;
            } else {
                container.displayParent = parent;
                if (!parent.displayChildren) {
                    parent.displayChildren = [];
                }
                parent.displayChildren.push(container);
            }

            if (container.displayFlag !== PIXI.DISPLAY_FLAG.MANUAL_CONTAINER) {
                var children = container.children;
                if (children && children.length > 0) {
                    if ((container as any)._mask || (container as any)._filters && (container as any)._filters.length || container.displayList) {
                        container.displayFlag = PIXI.DISPLAY_FLAG.AUTO_CONTAINER;
                    } else {
                        container.displayFlag = PIXI.DISPLAY_FLAG.AUTO_CHILDREN;
                        for (var i = 0; i < children.length; i++) {
                            this._addRecursive(children[i], container.displayParent);
                        }
                    }
                } else {
                    container.displayFlag = PIXI.DISPLAY_FLAG.AUTO_OBJECT;
                }
            }
        };

        updateDisplayLayers() {
            Group._layerUpdateId++;
            const children = this.children;
            for (let i=0;i<children.length;i++) {
                this._addRecursive(children[i], this)
            }
        };

        /**
         * Called from container that owns this display list
         * @param parentContainer
         */
        update(parentContainer: Container) {
            this.clear();
            var tempGroup = parentContainer.displayGroup;
            this.displayGroups.push(this.defaultDisplayGroup);
            this.defaultDisplayGroup.add(parentContainer);

            this.container = parentContainer;
            var children = parentContainer.children;
            var i = 0;
            for (i = 0; i < children.length; i++) {
                this._addRecursive(children[i], parentContainer);
            }
            var groups = this.displayGroups;
            groups.sort(DisplayList.compareZIndex);
            for (i = 0; i < groups.length; i++) {
                groups[i].currentIndex = i;
                groups[i].update();
            }
            this.emit('afterUpdate');
        };

        /**
         * renders container with webgl context
         * @param parentContainer
         * @param renderer
         */
        renderWebGL(renderer: WebGLRenderer) {
            //prevent recursion ;)
            parentContainer.displayFlag = PIXI.DISPLAY_FLAG.AUTO_CHILDREN;
            //lets do it!
            var groups = this.displayGroups;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                group.renderWebGL(parentContainer, renderer);
            }
        };

        /**
         * renders container with canvas2d context
         * @param parentContainer
         * @param renderer
         */
        renderCanvas(renderer: CanvasRenderer) {
            var groups = this.displayGroups;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                group.renderCanvas(parentContainer, renderer);
            }
        };

    }
}
