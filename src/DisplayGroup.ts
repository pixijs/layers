/**
 * A shared component for multiple DisplayObject's allows to specify rendering order for them
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 * @param zIndex {number} z-index for display group
 * @param sorting {boolean | Function} if you need to sort elements inside, please provide function that will set displayObject.zOrder accordingly
 */

module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;
    import utils = PIXI.utils;

    export class DisplayGroup extends utils.EventEmitter {
        computedChildren: Array<DisplayObject>;

        currentDisplayList: DisplayList;

        currentIndex = 0;

        zIndex = 0;

        enableSort = false;

        constructor(zIndex: number, sorting: boolean | Function) {
            super();
            /**
             * Children that were rendered in last run
             * @type {Array}
             */
            this.computedChildren = [];

            /**
             * Temporary variable for manipulations inside displayList
             * @type {null}
             */
            this.currentDisplayList = null;

            /**
             * real order in the current display list
             * @type {number}
             */
            this.currentIndex = 0;

            /**
             * Groups with lesser zIndex will be rendered first. Inside one group objects with largest zOrder will be rendered first.
             * @type {number}
             */
            this.zIndex = zIndex || 0;

            /**
             * sort elements inside or not
             * @type {boolean}
             */
            this.enableSort = !!sorting;

            if (typeof sorting === 'function') {
                this.on('add', sorting);
            }
        }

        /**
         *
         * @param a
         * @param b
         * @returns {number}
         */
        static compareZOrder(a: DisplayObject, b: DisplayObject) {
            if (a.zOrder < b.zOrder) {
                return 1;
            }
            if (a.zOrder > b.zOrder) {
                return -1;
            }
            return a.updateOrder - b.updateOrder;
        };

        /**
         * clears temporary variables
         */
        clear() {
            var list = this.computedChildren;
            for (var i = 0; i < list.length; i++) {
                var children = (list[i] as Container).displayChildren;
                if (children && children.length > 0) {
                    for (var j = 0; j < children.length; j++) {
                        children[j].displayParent = null;
                    }
                    children.length = 0;
                }
                list[i].displayParent = null;
            }
            list.length = 0;
            this.currentDisplayList = null;
            this.currentIndex = 0;
        };

        /**
         * used only by displayList before sorting takes place
         * @param container {PIXI.DisplayObject}
         */
        add(displayObject: DisplayObject) {
            displayObject.displayOrder = this.computedChildren.length;
            this.emit('add', displayObject);
            this.computedChildren.push(displayObject);
        };

        /**
         * Called after all childrens are computed
         */
        update() {
            this.emit('update');
            if (this.enableSort && this.computedChildren.length > 1) {
                this.computedChildren.sort(DisplayGroup.compareZOrder);
            }
        };

        /**
         * renders everything inside
         * @param parentContainer
         * @param renderer
         */
        renderWebGL(parentContainer: Container, renderer: WebGLRenderer) {
            var list = this.computedChildren;
            for (var j = 0; j < list.length; j++) {
                var container = list[j] as Container;
                if (container.displayFlag) {
                    container.renderWebGL(renderer);
                } else {
                    container.displayOrder = renderer.incDisplayOrder();
                    (container as any)._renderWebGL(renderer);
                    var children = container.displayChildren;
                    if (children && children.length) {
                        for (var k = 0; k < children.length; k++) {
                            var child = children[k];
                            child.displayOrder = renderer.incDisplayOrder();
                            if (child.displayFlag) {
                                child.renderWebGL(renderer);
                            } else {
                                (child as any)._renderWebGL(renderer);
                            }
                        }
                    }
                }
            }
        };

        /**
         * renders everything inside
         * @param parentContainer
         * @param renderer
         */
        renderCanvas(parentContainer: Container, renderer: CanvasRenderer) {
            var list = this.computedChildren;
            for (var j = 0; j < list.length; j++) {
                var container = list[j] as Container;
                if (container.displayFlag) {
                    container.renderCanvas(renderer);
                } else {
                    container.displayOrder = renderer.incDisplayOrder();
                    (container as any)._renderCanvas(renderer);
                    var children = container.displayChildren;
                    if (children && children.length) {
                        for (var k = 0; k < children.length; k++) {
                            var child = children[k];
                            child.displayOrder = renderer.incDisplayOrder();
                            if (child.displayFlag) {
                                child.renderCanvas(renderer);
                            } else {
                                (child as any)._renderCanvas(renderer);
                            }
                        }
                    }
                }
            }
        };
    }
}
