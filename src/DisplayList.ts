module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;
    import utils = PIXI.utils;
    export class DisplayList extends utils.EventEmitter {
        /**
         * Children that were rendered in last run
         * @type {Array}
         */
        displayGroups: Array<DisplayGroup>;

        container: Container = null;

        /**
         * how many elements were rendered by display list last time
         * also it is used to generate updateOrder for them
         * @type {number}
         */
        totalElements = 0;

        defaultDisplayGroup: DisplayGroup;

        /**
         * A component for container, sorts all children inside according to their displayGroups
         *
         * @class
         * @extends EventEmitter
         * @memberof PIXI
         */
        constructor() {
            super();

            this.displayGroups = [];

            this.defaultDisplayGroup = new DisplayGroup(0, false);
        }


        /**
         * clears all display lists that were used in last rendering session
         * please clear it when you stop using this displayList, otherwise you may have problems with GC in some cases
         */
        clear() {
            var list = this.displayGroups;
            for (var i = 0; i < list.length; i++) {
                list[i].clear();
            }
            list.length = 0;
            this.totalElements = 0;
            this.container = null;
        };

        /**
         * alias for clear()
         * please call it if you stop using this displayList
         */
        destroy() {
            this.clear();
        };

        static compareZIndex(a: DisplayGroup, b: DisplayGroup) {
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex;
            }
            return a.currentIndex - b.currentIndex;
        };

        /**
         *
         * @param displayObject {PIXI.DisplayObject} container that we are adding to displaylist
         * @param parent {PIXI.Container} it is not direct parent, but some of ancestors
         * @private
         */
        _addRecursive(displayObject: DisplayObject, parent: Container) {
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
        renderWebGL(parentContainer: Container, renderer: WebGLRenderer) {
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
        renderCanvas(parentContainer: Container, renderer: CanvasRenderer) {
            var groups = this.displayGroups;
            for (var i = 0; i < groups.length; i++) {
                var group = groups[i];
                group.renderCanvas(parentContainer, renderer);
            }
        };

    }
}
