var EventEmitter = PIXI.utils.EventEmitter,
    utils = require('./utils'),
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

    this.defaultDisplayGroup = new DisplayGroup(0);
}

DisplayList.prototype = Object.create(EventEmitter.prototype);

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
 * @param container {PIXI.DisplayObject} container that we are adding to displaylist
 * @param parent {PIXI.Container} it is not direct parent, but some of ancestors
 * @private
 */
DisplayList.prototype._addRecursive = function (container, parent) {
    if (!container.visible || !container.renderable) {
        return;
    }
    var groups = this.displayGroups;
    var group = parent.displayGroup;
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
        if (container._mask || container._filters && container._filters.length || container.displayList) {
            container.displayFlag = Const.DISPLAY_FLAG.AUTO_CONTAINER;
        } else {
            var children = container.children;
            if (children && children.length > 0) {
                container.displayFlag = Const.DISPLAY_FLAG.AUTO_CHILDREN;
                for (var i = 0; i < children.length; i++) {
                    this._addRecursive(children[i], container.displayParent);
                }
            } else {
                container.displayFlag = Const.DISPLAY_FLAG.AUTO_OBJECT;
            }
        }
    }
};

/**
 * Called from container that owns this display list
 * @param parentContainer
 */
DisplayList.prototype.update = function (parentContainer) {
    this.clear();
    parentContainer.displayGroup = this.defaultDisplayGroup;
    var children = parentContainer.children;
    for (var i = 0; i < children.length; i++) {
        this._addRecursive(children[i], parentContainer);
    }
    this.displayGroups.sort(DisplayList.compareZIndex);
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
                container.displayOrder = utils.incDisplayOrder();
                container._renderWebGL(renderer);
                var children = child.displayChildren;
                if (children && children.length) {
                    for (var k = 0; k < children.length; k++) {
                        var child = children[k];
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
                container.displayOrder = utils.incDisplayOrder();
                container._renderCanvas(renderer);
                var children = child.displayChildren;
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
