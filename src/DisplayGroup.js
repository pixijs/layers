var EventEmitter = PIXI.utils.EventEmitter;
/**
 * A shared component for multiple DisplayObject's allows to specify rendering order for them
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 * @param zIndex {number} z-index for display group
 * @param sorting {boolean | Function} if you need to sort elements inside, please provide function that will set displayObject.zOrder accordingly
 */

function DisplayGroup(zIndex, sorting) {
    EventEmitter.call(this);
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

DisplayGroup.prototype = Object.create(EventEmitter.prototype);
DisplayGroup.prototype.constructor = DisplayGroup;
module.exports = DisplayGroup;

/**
 * 
 * @param a
 * @param b
 * @returns {number}
 */
DisplayGroup.compareZOrder = function (a, b) {
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
DisplayGroup.prototype.clear = function () {
    var list = this.computedChildren;
    for (var i = 0; i < list.length; i++) {
        var children = list[i].displayChildren;
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
DisplayGroup.prototype.add = function (displayObject) {
    displayObject.displayOrder = this.computedChildren.length;
    this.emit('add', displayObject);
    this.computedChildren.push(displayObject);
};

/**
 * Called after all childrens are computed
 */
DisplayGroup.prototype.update = function () {
    this.emit('update');
    if (this.enableSort && this.computedChildren.length > 1) {
        this.computedChildren.sort(DisplayGroup.compareZOrder);
    }
};
