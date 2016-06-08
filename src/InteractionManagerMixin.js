//TODO: add maxDisplayOrder for displayObjects and use it to speed up the interaction here

var gameofbombs = !!PIXI.Camera2d;

/**
 * @mixin
 */
var InteractionManagerMixin = {
    /**
     * This is private recursive copy of processInteractive
     */
    _processInteractive: function (point, displayObject, hitTestOrder, interactive) {
        if (!displayObject || !displayObject.visible) {
            return false;
        }

        // Took a little while to rework this function correctly! But now it is done and nice and optimised. ^_^
        //
        // This function will now loop through all objects and then only hit test the objects it HAS to, not all of them. MUCH faster..
        // An object will be hit test if the following is true:
        //
        // 1: It is interactive.
        // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
        //
        // As another little optimisation once an interactive object has been hit we can carry on through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
        // A final optimisation is that an object is not hit test directly if a child has already been hit.

        var hit = 0,
            interactiveParent = interactive = displayObject.interactive || interactive;


        // if the displayobject has a hitArea, then it does not need to hitTest children.
        if (displayObject.hitArea) {
            interactiveParent = false;
        }

        // it has a mask! Then lets hit test that before continuing..
        if (hitTestOrder < Infinity && displayObject._mask) {
            if (!displayObject._mask.containsPoint(point)) {
                hitTestOrder = Infinity;
            }
        }

        // it has a filterArea! Same as mask but easier, its a rectangle
        if (hitTestOrder < Infinity && displayObject.filterArea) {
            if (!displayObject.filterArea.contains(point.x, point.y)) {
                hitTestOrder = Infinity;
            }
        }

        // ** FREE TIP **! If an object is not interactive or has no buttons in it (such as a game scene!) set interactiveChildren to false for that displayObject.
        // This will allow pixi to completly ignore and bypass checking the displayObjects children.
        if (displayObject.interactiveChildren) {
            var children = displayObject.children;

            for (var i = children.length - 1; i >= 0; i--) {

                var child = children[i];

                var hitChild = this._processInteractive(point, child, hitTestOrder, interactiveParent);
                // time to get recursive.. if this function will return if something is hit..
                if (hitChild) {
                    hit = hitChild;
                    hitTestOrder = hitChild;
                }
            }
        }


        // no point running this if the item is not interactive or does not have an interactive parent.
        if (interactive) {
            // if we are hit testing (as in we have no hit any objects yet)
            // We also don't need to worry about hit testing if once of the displayObjects children has already been hit!
            if (hitTestOrder < displayObject.displayOrder) {
                if (gameofbombs) {
                    //gameofbombs version
                    if (displayObject.hitArea && displayObject.isRaycastPossible) {
                        if (displayObject.containsPoint(point)) {
                            hit = displayObject.displayOrder;
                        }
                    }
                } else {
                    //pixi v4
                    if (displayObject.hitArea) {
                        displayObject.worldTransform.applyInverse(point, this._tempPoint);
                        if (displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                            hit = displayObject.displayOrder;
                        }
                    }
                    else if (displayObject.containsPoint) {
                        if (displayObject.containsPoint(point)) {
                            hit = displayObject.displayOrder;
                        }
                    }
                }
            }

            if (displayObject.interactive) {
                this._queueAdd(displayObject, hit);
            }
        }

        return hit;

    },

    /**
     * This function is provides a neat way of crawling through the scene graph and running a specified function on all interactive objects it finds.
     * It will also take care of hit testing the interactive objects and passes the hit across in the function.
     *
     * @param  {PIXI.Point} point the point that is tested for collision
     * @param  {PIXI.Container|PIXI.Sprite|PIXI.extras.TilingSprite} displayObject the displayObject that will be hit test (recursively crawls its children)
     * @param  {boolean} hitTest this indicates if the objects inside should be hit test against the point
     * @param {Function} func the function that will be called on each interactive object. The displayObject and hit will be passed to the function
     * @private
     * @return {boolean} returns true if the displayObject hit the point
     */
    processInteractive: function (point, displayObject, func, hitTest) {
        this._startInteractionProcess();
        this._processInteractive(point, displayObject, hitTest ? 0 : Infinity, false);
        this._finishInteractionProcess(func);
    },

    _startInteractionProcess: function () {
        //move it to constructor
        this._eventDisplayOrder = 1;
        if (!this._queue) {
            //move it to constructor
            this._queue = [[], []];
        }
        this._queue[0].length = 0;
        this._queue[1].length = 0;
    },

    _queueAdd: function (displayObject, order) {
        var queue = this._queue;
        if (order < this._eventDisplayOrder) {
            queue[0].push(displayObject);
        } else {
            if (order > this._eventDisplayOrder) {
                this._eventDisplayOrder = order;
                var q = queue[1];
                for (var i = 0; i < q.length; i++) {
                    queue[0].push(q[i]);
                }
                queue[1].length = 0;
            }
            queue[1].push(displayObject);
        }
    },

    /**
     *
     * @param {Function} func the function that will be called on each interactive object. The displayObject and hit will be passed to the function
     */
    _finishInteractionProcess: function (func) {
        var queue = this._queue;
        var q = queue[0];
        var i;
        for (i = 0; i < q.length; i++) {
            func(q[i], false);
        }
        q = queue[1];
        for (i = 0; i < q.length; i++) {
            func(q[i], true);
        }
    }
};

module.exports = InteractionManagerMixin;
