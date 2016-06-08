var EventEmitter = PIXI.utils.EventEmitter,
    Const = require('./Const'),
    DisplayGroup = require('./DisplayGroup');
/**
 * A component for container, sorts all children inside according to their displayGroups
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 */
function DisplayList() {
    EventEmitter.call(this);
    /**
     * Children that were rendered in last run
     * @type {Array}
     */
    this.displayGroups = [];

    this.container = null;

    /**
     * how many elements were rendered by display list last time
     * also it is used to generate updateOrder for them
     * @type {number}
     */
    this.totalElements = 0;

    this.defaultDisplayGroup = new DisplayGroup(0, false);
}

DisplayList.prototype = Object.create(EventEmitter.prototype);
DisplayList.prototype.constructor = DisplayList;
module.exports = DisplayList;

/**
 * clears all display lists that were used in last rendering session
 * please clear it when you stop using this displayList, otherwise you may have problems with GC in some cases
 */
DisplayList.prototype.clear = function () {
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
DisplayList.prototype.destroy = function () {
    this.clear();
};

DisplayList.compareZIndex = function (a, b) {
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
DisplayList.prototype._addRecursive = function (container, parent) {
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

        container.displayParent = this;
    } else {
        container.displayParent = parent;
        if (!parent.displayChildren) {
            parent.displayChildren = [];
        }
        parent.displayChildren.push(container);
    }

    if (container.displayFlag !== Const.DISPLAY_FLAG.MANUAL_CONTAINER) {
        var children = container.children;
        if (children && children.length > 0) {
            if (container._mask || container._filters && container._filters.length || container.displayList) {
                container.displayFlag = Const.DISPLAY_FLAG.AUTO_CONTAINER;
            } else {
                container.displayFlag = Const.DISPLAY_FLAG.AUTO_CHILDREN;
                for (var i = 0; i < children.length; i++) {
                    this._addRecursive(children[i], container.displayParent);
                }
            }
        } else {
            container.displayFlag = Const.DISPLAY_FLAG.AUTO_OBJECT;
        }
    }
};

/**
 * Called from container that owns this display list
 * @param parentContainer
 */
DisplayList.prototype.update = function (parentContainer) {
    this.clear();
    var tempGroup = parentContainer.displayGroup;
    this.displayGroups.push(this.defaultDisplayGroup);
    this.defaultDisplayGroup.add(parentContainer);

    this.container = parentContainer;
    var children = parentContainer.children;
    var i;
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
DisplayList.prototype.renderWebGL = function (parentContainer, renderer) {
    var groups = this.displayGroups;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var list = group.computedChildren;
        for (var j = 0; j < list.length; j++) {
            var container = list[j];
            if (container.displayFlag) {
                container.renderWebGL(renderer);
            } else {
                container.displayOrder = renderer.incDisplayOrder();
                container._renderWebGL(renderer);
                var children = container.displayChildren;
                if (children && children.length) {
                    for (var k = 0; k < children.length; k++) {
                        var child = children[k];
                        child.displayOrder = renderer.incDisplayOrder();
                        if (child.displayFlag) {
                            child.renderWebGL(renderer);
                        } else {
                            child._renderWebGL(renderer);
                        }
                    }
                }
            }
        }
    }
};

/**
 * renders container with canvas2d context
 * @param parentContainer
 * @param renderer
 */
DisplayList.prototype.renderCanvas = function (parentContainer, renderer) {
    var groups = this.displayGroups;
    for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var list = group.computedChildren;
        for (var j = 0; j < list.length; j++) {
            var container = list[j];
            if (container.displayFlag) {
                container.renderCanvas(renderer);
            } else {
                container.displayOrder = renderer.incDisplayOrder();
                container._renderCanvas(renderer);
                var children = container.displayChildren;
                if (children && children.length) {
                    for (var k = 0; k < children.length; k++) {
                        var child = children[k];
                        if (child.displayFlag) {
                            child.renderCanvas(renderer);
                        } else {
                            child._renderCanvas(renderer);
                        }
                    }
                }
            }
        }
    }
};
