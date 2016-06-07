/**
 * A shared component for multiple DisplayObject's allows to specify rendering order for them
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
function DisplayGroup() {
    /**
     * Children that were rendered in last run
     * @type {Array}
     */
    this.computedChildren = [];
}
