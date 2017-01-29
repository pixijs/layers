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
    import WebGLRenderer = PIXI.WebGLRenderer;
    import CanvasRenderer = PIXI.CanvasRenderer;

    export class Group extends utils.EventEmitter {
        static _layerUpdateId = 0;

        computedChildren: Array<DisplayObject>;

        _activeLayer: Layer = null;

        _activeStage: Stage = null;

        _activeChildren: Array<DisplayObject> = [];

        _lastUpdateId = -1;

        enableSort = false;

        constructor(sorting: boolean | Function) {
            super();

            /**
             * sort elements inside or not
             * @type {boolean}
             */
            this.enableSort = !!sorting;

            if (typeof sorting === 'function') {
                this.on('add', sorting);
            }
        }

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
            this._activeLayer = null;
            this._activeStage = null;
            this._activeChildren.length = 0;
        };

        /**
         * used only by displayList before sorting takes place
         */
        add(displayObject: DisplayObject) {
            this.check();
            if (this._activeLayer) {
                this._activeLayer.displayChildren.push(displayObject);
            } else {
                this._activeChildren.push(displayObject);
            }
        };

        check() {
            if (this._lastUpdateId < Group._layerUpdateId) {
                this._lastUpdateId = Group._layerUpdateId;
                this.clear();
            }
        };
    }
}
