declare namespace PIXI {
    export interface Container {
        containerRenderWebGL?(renderer: Renderer): void;
    }
}

namespace PIXI.display {
    (Object as any).assign(PIXI.Container.prototype, {
        render: function (renderer: PIXI.Renderer): void {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return;
            }

            if (!this.visible) {
                this.displayOrder = 0;
                return;
            }

            this.displayOrder = renderer.incDisplayOrder();

            // if the object is not visible or the alpha is 0 then no need to render this element
            if (this.worldAlpha <= 0 || !this.renderable) {
                return;
            }

	        renderer._activeLayer = null;
            this.containerRenderWebGL(renderer);
	        renderer._activeLayer = this._activeParentLayer;
        },
        renderCanvas: function (renderer: PIXI.CanvasRenderer): void {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return;
            }

            if (!this.visible) {
                this.displayOrder = 0;
                return;
            }

            this.displayOrder = renderer.incDisplayOrder();

            // if the object is not visible or the alpha is 0 then no need to render this element
            if (this.worldAlpha <= 0 || !this.renderable) {
                return;
            }

	        renderer._activeLayer = null;
            this.containerRenderCanvas(renderer);
	        renderer._activeLayer = this._activeParentLayer;
        },
        containerRenderWebGL: PIXI.Container.prototype.render,
        containerRenderCanvas: (PIXI.Container as any).prototype.renderCanvas
    });
}declare namespace PIXI {
    export interface DisplayObject {
        parentGroup: PIXI.display.Group,

        /**
         * Object will be rendered
         *
         * please specify it to handle zOrder and zIndex
         *
         * its always null for layers
         *
         */
        parentLayer?: PIXI.display.Layer,


        _activeParentLayer?: PIXI.display.Layer,
        /**
         * zOrder is used to sort element inside the layer
         * It can be used with zIndex together: First PixiJS v5 sorts elements by zIndex inside a container,
         * then pixi-layers plugin sorts by zOrder inside a layer.
         */
        zOrder?: number,

        /**
         * updateOrder is calculated by DisplayList, it is required for sorting inside DisplayGroup
         */
        updateOrder?: number,

        /**
         * displayOrder is calculated by render, it is required for interaction
         */
        displayOrder?: number,

        /**
         * Stage will look inside for elements that can be re-arranged, if this flag is true
         * Make it false for ParticleContainer
         */
        layerableChildren?: boolean

	    /**
	     * is Layer
	     */
	    isLayer?: boolean;

	    containsPoint?(p: PIXI.IPoint): boolean;
    }
}

(Object as any).assign(PIXI.DisplayObject.prototype, {
    parentLayer: null,
    _activeParentLayer: null,
    parentGroup: null,
    zOrder: 0,
    zIndex: 0,
    updateOrder: 0,
    displayOrder: 0,
    layerableChildren: true,
	isLayer: false
});

if (PIXI.ParticleContainer) {
    PIXI.ParticleContainer.prototype.layerableChildren = false;
}
else if ((PIXI as any).ParticleContainer) {
    (PIXI as any).ParticleContainer.prototype.layerableChildren = false;
}
/**
 * A shared component for multiple DisplayObject's allows to specify rendering order for them
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 * @param zIndex {number} z-index for display group
 * @param sorting {boolean | Function} if you need to sort elements inside, please provide function that will set displayObject.zOrder accordingly
 */

namespace PIXI.display {
    import DisplayObject = PIXI.DisplayObject;
    import utils = PIXI.utils;

    export class Group extends utils.EventEmitter {
        static _layerUpdateId = 0;

        _activeLayer: Layer = null;

        _activeStage: Stage = null;

        _activeChildren: Array<DisplayObject> = [];

        _lastUpdateId = -1;

        useRenderTexture: boolean = false;
        useDoubleBuffer: boolean = false;
        sortPriority: number = 0;
        clearColor : ArrayLike<number> = new Float32Array([0, 0, 0, 0]);

        //TODO: handle orphan groups
        //TODO: handle groups that don't want to be drawn in parent
        canDrawWithoutLayer = false;
        canDrawInParentStage = true;

        /**
         * default zIndex value for layers that are created with this Group
         * @type {number}
         */
        zIndex = 0;

        enableSort = false;

        constructor(zIndex: number, sorting: boolean | Function) {
            super();

            this.zIndex = zIndex;

            this.enableSort = !!sorting;

            if (typeof sorting === 'function') {
                this.on('sort', sorting);
            }
        }

        _tempResult: Array<DisplayObject> = [];
        _tempZero: Array<DisplayObject> = [];

        useZeroOptimization: boolean = false;

        doSort(layer: Layer, sorted: Array<DisplayObject>) {
            if ((this.listeners as any)('sort', true)) {
                for (let i = 0; i < sorted.length; i++) {
                    this.emit('sort', sorted[i]);
                }
            }
            if (this.useZeroOptimization) {
                this.doSortWithZeroOptimization(layer, sorted);
            } else {
                sorted.sort(Group.compareZIndex);
            }
        }

        static compareZIndex(a: DisplayObject, b: DisplayObject) {
            if (a.zOrder < b.zOrder) {
                return -1;
            }
            if (a.zOrder > b.zOrder) {
                return 1;
            }
            return a.updateOrder - b.updateOrder;
        }

        doSortWithZeroOptimization(layer: Layer, sorted: Array<DisplayObject>) {
            throw new Error("not implemented yet");
            //default sorting
            // const result = this._tempResult;
            // const zero = this._tempZero;
            // for (let i = 0; i < sorted.length; i++) {
            //     const elem = sorted[i];
            //     if (elem.zIndex == 0 && elem.zOrder == 0) {
            //         zero.push(elem);
            //     } else {
            //         result.push(elem);
            //     }
            // }
            // if (zero.length == 0) {
            //     sorted.sort(Group.compareZOrder);
            // } else {
            //     result.sort(Group.compareZOrder);
            //     let j = 0;
            //     for (let i = 0; i < result.length; i++) {
            //         const elem = result[i];
            //         if (elem.zIndex < 0 && elem.zIndex == 0 && elem.zOrder > 0) {
            //             sorted[j++] = result[i]++;
            //         }
            //     }
            // }
        }

        /**
         * clears temporary variables
         */
        clear() {
            this._activeLayer = null;
            this._activeStage = null;
            this._activeChildren.length = 0;
        }

        /**
         * used only by displayList before sorting takes place
         */
        addDisplayObject(stage: Stage, displayObject: DisplayObject) {
            this.check(stage);
            displayObject._activeParentLayer = this._activeLayer;
            if (this._activeLayer) {
                this._activeLayer._activeChildren.push(displayObject);
            } else {
                this._activeChildren.push(displayObject);
            }
        }

        /**
         * called when corresponding layer is found in current stage
         * @param stage
         * @param layer
         */
        foundLayer(stage: Stage, layer: Layer) {
            this.check(stage);
            if (this._activeLayer != null) {
                Group.conflict();
            }
            this._activeLayer = layer;
            this._activeStage = stage;
        }

        /**
         * called after stage finished the work
         * @param stage
         */
        foundStage(stage: Stage) {
            if (!this._activeLayer && !this.canDrawInParentStage) {
                this.clear();
            }
        }

        check(stage: Stage) {
            if (this._lastUpdateId < Group._layerUpdateId) {
                this._lastUpdateId = Group._layerUpdateId;
                this.clear();
                this._activeStage = stage;
            } else if (this.canDrawInParentStage) {
                let current = this._activeStage;
                while (current && current != stage) {
                    current = current._activeParentStage;
                }
                this._activeStage = current;
                if (current == null) {
                    this.clear();
                    return
                }
            }
        }

        static _lastLayerConflict = 0;

        static conflict() {
            if (Group._lastLayerConflict + 5000 < Date.now()) {
                Group._lastLayerConflict = Date.now();
                console.log("PIXI-display plugin found two layers with the same group in one stage - that's not healthy. Please place a breakpoint here and debug it");
            }
        }
    }
}
//TODO: add maxDisplayOrder for displayObjects and use it to speed up the interaction here

/**
 * @mixin
 */

namespace PIXI.display {
    import DisplayObject = PIXI.DisplayObject;
    import Point = PIXI.Point;
    import InteractionEvent = PIXI.InteractionEvent;

    export function processInteractive51(strangeStuff: InteractionEvent | Point, displayObject: DisplayObject, func: Function, hitTest: boolean, interactive: boolean) {
        if (!this.search) {
            this.search = new LayersTreeSearch();
        }
        this.search.findHit(strangeStuff, displayObject, func, hitTest);

        const delayedEvents = this.delayedEvents;

        if (delayedEvents && delayedEvents.length) {
            // Reset the propagation hint, because we start deeper in the tree again.
            (strangeStuff as any).stopPropagationHint = false;

            const delayedLen = delayedEvents.length;

            this.delayedEvents = [];

            for (let i = 0; i < delayedLen; i++) {
                const {displayObject, eventString, eventData} = delayedEvents[i];

                // When we reach the object we wanted to stop propagating at,
                // set the propagation hint.
                if (eventData.stopsPropagatingAt === displayObject) {
                    eventData.stopPropagationHint = true;
                }

                this.dispatchEvent(displayObject, eventString, eventData);
            }
        }
    }

    export function patchInteractionManager(interactionManager: any) {
        if (!interactionManager) {
            return;
        }
        if (interactionManager.search) {
            if (!interactionManager.search.worksWithDisplay) {
                interactionManager.search = new LayersTreeSearch();
            }
        } else {
            interactionManager.processInteractive = processInteractive51;
        }
    }
}
/**
 * Created by ivanp on 29.01.2017.
 */

namespace PIXI.display {
    export class LayerTextureCache {
        constructor(public layer: Layer) {
        }

        renderTexture: PIXI.RenderTexture = null;
        doubleBuffer: Array<PIXI.RenderTexture> = null;
        currentBufferIndex = 0;
        _tempRenderTarget: PIXI.RenderTexture = null;
        _tempRenderTargetSource = new PIXI.Rectangle();

        initRenderTexture(renderer?: PIXI.Renderer) {
            const width = renderer ? renderer.screen.width : 100;
            const height = renderer ? renderer.screen.height : 100;
            const resolution = renderer ? renderer.resolution : PIXI.settings.RESOLUTION;

            this.renderTexture = PIXI.RenderTexture.create({width, height, resolution});

            if (this.layer.group.useDoubleBuffer) {
                this.doubleBuffer = [
                    PIXI.RenderTexture.create({width, height, resolution}),
                    PIXI.RenderTexture.create({width, height, resolution})
                ];
            }
        }

        getRenderTexture() {
            if (!this.renderTexture) {
                this.initRenderTexture();
            }
            return this.renderTexture;
        }

        pushTexture(renderer: PIXI.Renderer) {
            const screen = renderer.screen;

            if (!this.renderTexture) {
                this.initRenderTexture(renderer);
            }

            const rt = this.renderTexture;
            const group = this.layer.group;
            const db = this.doubleBuffer;

            if (rt.width !== screen.width ||
                rt.height !== screen.height ||
                rt.baseTexture.resolution !== renderer.resolution) {
                rt.baseTexture.resolution = renderer.resolution;
                rt.resize(screen.width, screen.height);

                if (db) {
                    db[0].baseTexture.resolution = renderer.resolution;
                    db[0].resize(screen.width, screen.height);
                    db[1].baseTexture.resolution = renderer.resolution;
                    db[1].resize(screen.width, screen.height);
                }
            }

            this._tempRenderTarget = renderer.renderTexture.current;
            this._tempRenderTargetSource.copyFrom(renderer.renderTexture.sourceFrame);

            renderer.batch.flush();

            if (group.useDoubleBuffer) {
                // double-buffer logic
                let buffer = db[this.currentBufferIndex];
                if (!(buffer.baseTexture as any)._glTextures[renderer.CONTEXT_UID]) {
                    renderer.renderTexture.bind(buffer, undefined, undefined);
                    renderer.texture.bind(buffer);
                    if (group.clearColor) {
                        renderer.renderTexture.clear(group.clearColor as any);
                    }
                }
                renderer.texture.unbind(rt.baseTexture);
                (rt.baseTexture as any)._glTextures = (buffer.baseTexture as any)._glTextures;
                (rt.baseTexture as any).framebuffer = (buffer.baseTexture as any).framebuffer;

                buffer = db[1 - this.currentBufferIndex];
                renderer.renderTexture.bind(buffer, undefined, undefined);
            } else {
                // simple logic
                renderer.renderTexture.bind(rt, undefined, undefined);
            }

            if (group.clearColor) {
                renderer.renderTexture.clear(group.clearColor as any);
            }

            // fix for filters
            const filterStack = renderer.filter.defaultFilterStack;
            if (filterStack.length > 1) {
                filterStack[filterStack.length - 1].renderTexture = renderer.renderTexture.current;
            }
        }

        popTexture(renderer: PIXI.Renderer) {
            renderer.batch.flush();
            // switch filters back
            const filterStack = renderer.filter.defaultFilterStack;
            if (filterStack.length > 1) {
                filterStack[filterStack.length - 1].renderTexture = this._tempRenderTarget;
            }
            renderer.renderTexture.bind(this._tempRenderTarget, this._tempRenderTargetSource, undefined);
            this._tempRenderTarget = null;

	        const rt = this.renderTexture;
	        const group = this.layer.group;
	        const db = this.doubleBuffer;

	        if (group.useDoubleBuffer) {
		        renderer.texture.unbind(rt.baseTexture);
		        this.currentBufferIndex = 1 - this.currentBufferIndex;
		        let buffer = db[this.currentBufferIndex];
		        (rt.baseTexture as any)._glTextures = (buffer.baseTexture as any)._glTextures;
		        (rt.baseTexture as any).framebuffer = (buffer.baseTexture as any).framebuffer;
	        }
        }

        destroy() {
            if (this.renderTexture) {
                this.renderTexture.destroy();
                if (this.doubleBuffer) {
                    this.doubleBuffer[0].destroy(true);
                    this.doubleBuffer[1].destroy(true);
                }
            }
        }
    }

    export class Layer extends PIXI.Container {
        constructor(group: Group = null) {
            super();
            if (group != null) {
                this.group = group;
                this.zIndex = group.zIndex;
            } else {
                this.group = new Group(0, false);
            }
            this._tempChildren = this.children;
        }

        isLayer = true;
        group: Group = null;
        _activeChildren: Array<PIXI.DisplayObject> = [];
        _tempChildren: Array<PIXI.DisplayObject> = null;
        _activeStageParent: Stage = null;
        _sortedChildren: Array<PIXI.DisplayObject> = [];
        _tempLayerParent: Layer = null;

        textureCache: LayerTextureCache;
        insertChildrenBeforeActive = true;
        insertChildrenAfterActive = true;

        beginWork(stage: Stage) {
            const active = this._activeChildren;
            this._activeStageParent = stage;
            this.group.foundLayer(stage, this);
            const groupChildren = this.group._activeChildren;
            active.length = 0;
            for (let i = 0; i < groupChildren.length; i++) {
                groupChildren[i]._activeParentLayer = this;
                active.push(groupChildren[i]);
            }
            groupChildren.length = 0;
        }

        endWork() {
            const children = this.children;
            const active = this._activeChildren;
            const sorted = this._sortedChildren;

            for (let i = 0; i < active.length; i++) {
                this.emit("display", active[i])
            }

            sorted.length = 0;
            if (this.insertChildrenBeforeActive) {
                for (let i = 0; i < children.length; i++) {
                    sorted.push(children[i]);
                }
            }
            for (let i = 0; i < active.length; i++) {
                sorted.push(active[i]);
            }
            if (!this.insertChildrenBeforeActive &&
                this.insertChildrenAfterActive) {
                for (let i = 0; i < children.length; i++) {
                    sorted.push(children[i]);
                }
            }

            if (this.group.enableSort) {
                this.doSort();
            }
        }

        get useRenderTexture() {
            return this.group.useRenderTexture;
        }

        set useRenderTexture(value: boolean) {
            this.group.useRenderTexture = value;
        }

        get useDoubleBuffer() {
            return this.group.useDoubleBuffer;
        }

        set useDoubleBuffer(value: boolean) {
            this.group.useDoubleBuffer = value;
        }

        get clearColor() {
            return this.group.clearColor;
        }

        set clearColor(value: ArrayLike<number>) {
            this.group.clearColor = value;
        }

        get sortPriority() {
            return this.group.sortPriority;
        }

        set sortPriority(value: number) {
            this.group.sortPriority = value;
        }

        getRenderTexture() {
            if (!this.textureCache) {
                this.textureCache = new LayerTextureCache(this);
            }
            return this.textureCache.getRenderTexture();
        }

        updateDisplayLayers() {

        }

        /**
         * you can override this method for this particular layer, if you want
         */
        doSort() {
            this.group.doSort(this, this._sortedChildren);
        }

        _preRender(renderer: PIXI.Renderer): boolean {
            if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
                return false;
            }

            if (!this.visible) {
                this.displayOrder = 0;
                return false;
            }

            this.displayOrder = renderer.incDisplayOrder();

            // if the object is not visible or the alpha is 0 then no need to render this element
            if (this.worldAlpha <= 0 || !this.renderable) {
                return false;
            }

            // we are making a hack with swapping children, it can go wrong easily
            // this is special "recover" if that allows stage to recover just after failed frame

            if (this.children !== this._sortedChildren &&
                this._tempChildren != this.children) {
                this._tempChildren = this.children;
            }

            //just a temporary feature - getBounds() for filters will work with that
            //TODO: make a better hack for getBounds()

            (this as any)._boundsID++;
            (this as any).children = this._sortedChildren;

            this._tempLayerParent = renderer._activeLayer;
            renderer._activeLayer = this;
            return true;
        }

        _postRender(renderer: PIXI.Renderer) {
            (this as any).children = this._tempChildren;
            renderer._activeLayer = this._tempLayerParent;
            this._tempLayerParent = null;
        }

        render(renderer: PIXI.Renderer) {
            if (!this._preRender(renderer)) {
                return;
            }

            if (this.group.useRenderTexture) {
                if (!this.textureCache) {
                    this.textureCache = new LayerTextureCache(this);
                }
                this.textureCache.pushTexture(renderer);
            }

            this.containerRenderWebGL(renderer);
            this._postRender(renderer);

            if (this.group.useRenderTexture) {
                this.textureCache.popTexture(renderer);
            }
        }

        destroy(options?: any) {
            if (this.textureCache) {
                this.textureCache.destroy();
                this.textureCache = null;
            }
            super.destroy(options);
        }
    }

    (Layer.prototype as any).renderCanvas = function(renderer: PIXI.CanvasRenderer) {
        if (this._preRender(renderer)) {
            this.containerRenderCanvas(renderer);
            this._postRender(renderer);
        }
    }
}
//TODO: add maxDisplayOrder for displayObjects and use it to speed up the interaction here

/**
 * @mixin
 */

namespace PIXI.display {
    import DisplayObject = PIXI.DisplayObject;
    import Point = PIXI.Point;
    import Graphics = PIXI.Graphics;
    import Container = PIXI.Container;
    import InteractionEvent = PIXI.InteractionEvent;

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
declare namespace PIXI {
    interface Renderer {
        _activeLayer?: PIXI.display.Layer
        _renderSessionId?: number
        _lastDisplayOrder?: number
        CONTEXT_UID?: number
        incDisplayOrder?(): number
    }
    interface CanvasRenderer {
        _activeLayer?: PIXI.display.Layer
        _renderSessionId?: number
        _lastDisplayOrder?: number
        incDisplayOrder?(): number
    }
}

namespace PIXI.display {
    (Object as any).assign(PIXI.Renderer.prototype, {
        _lastDisplayOrder: 0,
        _activeLayer: null,

        incDisplayOrder() {
            return ++this._lastDisplayOrder;
        },

        _oldRender: PIXI.Renderer.prototype.render,

        render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
            if (!renderTexture) {
                this._lastDisplayOrder = 0;
            }
            this._activeLayer = null;
            if ((displayObject as Stage).isStage) {
                (displayObject as Stage).updateStage()
            }
            patchInteractionManager(this.plugins.interaction);
            this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
        }
    });

    let canvasRenderer = (PIXI as any).CanvasRenderer;
    if (canvasRenderer) {
        (Object as any).assign(canvasRenderer.prototype, {
            _lastDisplayOrder: 0,
            _activeLayer: null,

            incDisplayOrder() {
                return ++this._lastDisplayOrder;
            },

            _oldRender: canvasRenderer.prototype.render,

            render(displayObject: PIXI.DisplayObject, renderTexture?: PIXI.RenderTexture, clear?: boolean, transform?: PIXI.Transform, skipUpdateTransform?: boolean) {
                if (!renderTexture) {
                    this._lastDisplayOrder = 0;
                }
                this._activeLayer = null;
                if ((displayObject as Stage).isStage) {
                    (displayObject as Stage).updateStage()
                }
                patchInteractionManager(this.plugins.interaction);
                this._oldRender(displayObject, renderTexture, clear, transform, skipUpdateTransform);
            }
        });
    }
}
namespace PIXI.display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;

    /**
     * Container for layers
     *
     */
    export class Stage extends Layer {
        constructor() {
            super();
        }

        static _updateOrderCounter: number = 0;

        isStage = true;

        _tempGroups: Array<DisplayObject> = [];

        /**
         * Found layers
         */
        _activeLayers: Array<Layer> = [];

        _activeParentStage: Stage = null;

        /**
         * clears all display lists that were used in last rendering session
         * please clear it when you stop using this displayList, otherwise you may have problems with GC in some cases
         */
        clear() {
            this._activeLayers.length = 0;
            this._tempGroups.length = 0;
        }

        destroy(options?: any) {
            this.clear();
            super.destroy(options);
        }

        /**
         *
         * @param displayObject {PIXI.DisplayObject} container that we are adding to Stage
         * @private
         */
        _addRecursive(displayObject: DisplayObject) {
            if (!displayObject.visible) {
                return;
            }

            if ((displayObject as any).isLayer) {
                const layer = displayObject as any as Layer;
                this._activeLayers.push(layer);
                layer.beginWork(this);
            }

            if (displayObject != this && (displayObject as any).isStage) {
                const stage = displayObject as Stage;
                stage.updateAsChildStage(this);
                return;
            }

            // sometimes people put UNDEFINED in parentGroup or parentLayer
            // that's why there is != instead of !==

            let group = displayObject.parentGroup;
            if (group != null) {
                group.addDisplayObject(this, displayObject);
            }
            const layer = displayObject.parentLayer;
            if (layer != null) {
                group = layer.group;
                group.addDisplayObject(this, displayObject);
            }

            displayObject.updateOrder = ++Stage._updateOrderCounter;
            if (displayObject.alpha <= 0 || !displayObject.renderable
                || !displayObject.layerableChildren
                || group && group.sortPriority) {
                return;
            }

            const children = (displayObject as Container).children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++) {
                    this._addRecursive(children[i]);
                }
            }
        }

        _addRecursiveChildren(displayObject: DisplayObject) {
            if (displayObject.alpha <= 0 || !displayObject.renderable
                || !displayObject.layerableChildren) {
                return;
            }
            const children = (displayObject as Container).children;
            if (children && children.length) {
                for (let i = 0; i < children.length; i++) {
                    this._addRecursive(children[i]);
                }
            }
        }

        _updateStageInner() {
            this.clear();
            this._addRecursive(this);
            const layers = this._activeLayers;

            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (layer.group.sortPriority) {
                    layer.endWork();
                    const sorted = layer._sortedChildren;
                    for (let j = 0; j < sorted.length; j++) {
                        this._addRecursiveChildren(sorted[j]);
                    }
                }
            }

            for (let i = 0; i < layers.length; i++) {
                const layer = layers[i];
                if (!layer.group.sortPriority) {
                    layer.endWork();
                }
            }
        }

        updateAsChildStage(stage: Stage) {
            this._activeParentStage = stage;
            Stage._updateOrderCounter = 0;
            this._updateStageInner();
        }

        updateStage() {
            this._activeParentStage = null;
            Group._layerUpdateId++;
            this._updateStageInner();
        };
    }
}
/// <reference types="pixi.js" />

namespace PIXI.display {
	(PIXI as any).display = PIXI.display;
}

declare module "pixi-layers" {
	export = PIXI.display;
}
