//TODO: add maxDisplayOrder for displayObjects and use it to speed up the interaction here

/**
 * @mixin
 */

namespace pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Point = PIXI.Point;
    import Graphics = PIXI.Graphics;
    import Container = PIXI.Container;
    import InteractionEvent = PIXI.interaction.InteractionEvent;

    export class LayersTreeSearch {
        _tempPoint = new Point();
        _queue = [[] as Array<DisplayObject>, [] as Array<DisplayObject>];
        _eventDisplayOrder = 0;
        worksWithDisplay = true;

        recursiveFindHit(point: Point, displayObject: DisplayObject, hitTestOrder: number, interactive: boolean, outOfMask: boolean): number {
            if (!displayObject || !displayObject.visible) {
                return 0;
            }

            let hit = 0,
                interactiveParent = interactive = displayObject.interactive || interactive;

            // if the displayobject has a hitArea, then it does not need to hitTest children.
            if (displayObject.hitArea) {
                interactiveParent = false;
            }

            if (displayObject._activeParentLayer) {
                outOfMask = false;
            }

            // it has a mask! Then lets hit test that before continuing..
            const mask: Graphics = (displayObject as any)._mask;
            if (hitTestOrder < Infinity && mask) {
                if (!mask.containsPoint(point)) {
                    outOfMask = true;
                }
            }

            // it has a filterArea! Same as mask but easier, its a rectangle
            if (hitTestOrder < Infinity && displayObject.filterArea) {
                if (!displayObject.filterArea.contains(point.x, point.y)) {
                    outOfMask = true;
                }
            }

            // ** FREE TIP **! If an object is not interactive or has no buttons in it
            // (such as a game scene!) set interactiveChildren to false for that displayObject.
            // This will allow pixi to completely ignore and bypass checking the displayObjects children.
            const children: Array<DisplayObject> = (displayObject as Container).children;
            if ((displayObject as Container).interactiveChildren && children) {
                for (let i = children.length - 1; i >= 0; i--) {
                    const child = children[i];

                    // time to get recursive.. if this function will return if something is hit..
                    const hitChild = this.recursiveFindHit(point, child, hitTestOrder, interactiveParent, outOfMask);
                    if (hitChild) {
                        // its a good idea to check if a child has lost its parent.
                        // this means it has been removed whilst looping so its best
                        if (!child.parent) {
                            continue;
                        }

                        hit = hitChild;
                        hitTestOrder = hitChild;
                    }
                }
            }

            // no point running this if the item is not interactive or does not have an interactive parent.
            if (interactive) {
                if (!outOfMask) {
                    // if we are hit testing (as in we have no hit any objects yet)
                    // We also don't need to worry about hit testing if once of the displayObjects children has already been hit!
                    if (hitTestOrder < displayObject.displayOrder) {
                        //pixi v4
                        if (displayObject.hitArea) {
                            displayObject.worldTransform.applyInverse(point, this._tempPoint);
                            if (displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                                hit = displayObject.displayOrder;
                            }
                        } else if ((displayObject as any).containsPoint) {
                            if ((displayObject as any).containsPoint(point)) {
                                hit = displayObject.displayOrder;
                            }
                        }
                    }

                    if (displayObject.interactive) {
                        this._queueAdd(displayObject, hit === Infinity ? 0 : hit);
                    }
                } else {
                    if (displayObject.interactive) {
                        this._queueAdd(displayObject, 0);
                    }
                }
            }

            return hit;
        }

        findHit(strangeStuff: InteractionEvent | Point, displayObject: DisplayObject, func: Function, hitTest: boolean)
        {
            let interactionEvent: InteractionEvent = null;
            let point: Point = null;
            if ((strangeStuff as InteractionEvent).data &&
                (strangeStuff as InteractionEvent).data.global) {
                interactionEvent = strangeStuff as InteractionEvent;
                point = interactionEvent.data.global;
            } else {
                point = strangeStuff as Point;
            }
            this._startInteractionProcess();
            this.recursiveFindHit(point, displayObject, hitTest ? 0 : Infinity, false, false);
            this._finishInteractionProcess(interactionEvent, func);
        }

        _startInteractionProcess() {
            //move it to constructor
            this._eventDisplayOrder = 1;
            if (!this._queue) {
                //move it to constructor
                this._queue = [[], []];
            }
            this._queue[0].length = 0;
            this._queue[1].length = 0;
        }

        _queueAdd(displayObject: DisplayObject, order: number) {
            let queue = this._queue;
            if (order < this._eventDisplayOrder) {
                queue[0].push(displayObject);
            } else {
                if (order > this._eventDisplayOrder) {
                    this._eventDisplayOrder = order;
                    let q = queue[1];
                    for (let i = 0, l = q.length; i < l; i++) {
                        queue[0].push(q[i]);
                    }
                    queue[1].length = 0;
                }
                queue[1].push(displayObject);
            }
        }
        _finishInteractionProcess(event: InteractionEvent, func: Function) {
            let queue = this._queue;
            let q = queue[0];
            for (var i = 0, l = q.length; i < l; i++) {
                if (event) {
                    //v4.3
                    if (func) {
                        func(event, q[i], false);
                    }
                } else {
                    //old
                    func(q[i], false);
                }
            }
            q = queue[1];
            for (var i = 0, l = q.length; i < l; i++) {
                if (event) {
                    //v4.3
                    if (!event.target) {
                        event.target = q[i];
                    }
                    if (func) {
                        func(event, q[i], true);
                    }
                } else {
                    //old
                    func(q[i], true);
                }
            }
        }
    }
}
