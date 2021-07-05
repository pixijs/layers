import * as utils from '@pixi/utils';

import type { DisplayObject } from '@pixi/display';
import type { Layer } from './Layer';
import type { Stage } from './Stage';

/**
 * A context for z-ordering {@link PIXI.DisplayObject}s within the same {@link Layer}.
 */
export class Group extends utils.EventEmitter
{
    static _layerUpdateId = 0;

    /** See {@link Layer#useRenderTexture} */
    public useRenderTexture = false;

    /** See {@link Layer#useDoubleBuffer} */
    public useDoubleBuffer = false;

    /**
     * Groups with a non-zero sort priority are sorted first.
     *
     * Unsure of the exact purpose yet :)
     */
    public sortPriority = 0;

    /** See {@link Layer#clearColor} */
    public clearColor : ArrayLike<number> = new Float32Array([0, 0, 0, 0]);

    // TODO: handle orphan groups
    // TODO: handle groups that don't want to be drawn in parent
    canDrawWithoutLayer = false;
    canDrawInParentStage = true;

    /** Default zIndex value for layers that are created with this Group */
    public zIndex: number;

    /** Enabling sorting objects within this group by {@link PIXI.DisplayObject#zOrder zOrder}. */
    public enableSort: boolean;

    private _activeLayer: Layer = null;
    private _activeStage: Stage = null;
    /** @private */
    _activeChildren: Array<DisplayObject> = [];
    private _lastUpdateId = -1;

    /**
     * @param zIndex - The z-index for the entire group.
     * @param sorting - This will enable sorting by z-order. You can also pass a callback that will assign
     *  the z-index _before_ sorting. This is useful, for example, when you want to sort by "y" - the callback
     *  can then set the {@link PIXI.DisplayObject#zOrder zOrder} to the y-coordinate. This callback is invoked
     *  as an event-listener to the {@link Group#sort} event.
     */
    constructor(zIndex = 0, sorting: boolean | ((displayObject: DisplayObject) => void) = false)
    {
        super();

        this.zIndex = zIndex || 0;
        this.enableSort = !!sorting;

        if (typeof sorting === 'function')
        {
            this.on('sort', sorting);
        }
    }

    doSort(layer: Layer, sorted: Array<DisplayObject>): void
    {
        if ((this.listeners as any)('sort', true))
        {
            for (let i = 0; i < sorted.length; i++)
            {
                this.emit('sort', sorted[i]);
            }
        }

        sorted.sort(Group.compareZIndex);
    }

    private static compareZIndex(a: DisplayObject, b: DisplayObject): number
    {
        if (a.zOrder < b.zOrder)
        {
            return -1;
        }
        if (a.zOrder > b.zOrder)
        {
            return 1;
        }

        return a.updateOrder - b.updateOrder;
    }

    /**
     * clears temporary variables
     */
    private clear(): void
    {
        this._activeLayer = null;
        this._activeStage = null;
        this._activeChildren.length = 0;
    }

    /**
     * Resolve a child {@link PIXI.DisplayObject} that is set to be in this group.
     *
     * This is an **internal** method.
     *
     * @see Stage#updateStage
     */
    _resolveChildDisplayObject(stage: Stage, displayObject: DisplayObject): void
    {
        this.check(stage);
        displayObject._activeParentLayer = this._activeLayer;

        if (this._activeLayer)
        {
            this._activeLayer._activeChildren.push(displayObject);
        }
        else
        {
            this._activeChildren.push(displayObject);
        }
    }

    /**
     * Resolve the layer rendering this group of {@link DisplayObject display objects}.
     *
     * This is an **internal** method.
     *
     * @see Layer#_onBeginLayerSubtreeTraversal
     */
    _resolveLayer(stage: Stage, layer: Layer): void
    {
        this.check(stage);

        if (this._activeLayer)
        {
            Group.conflict();
        }

        this._activeLayer = layer;
        this._activeStage = stage;
    }

    private check(stage: Stage): void
    {
        if (this._lastUpdateId < Group._layerUpdateId)
        {
            this._lastUpdateId = Group._layerUpdateId;
            this.clear();
            this._activeStage = stage;
        }
        else if (this.canDrawInParentStage)
        {
            let current = this._activeStage;

            while (current && current !== stage)
            {
                current = current._activeParentStage;
            }
            this._activeStage = current;
            if (current === null)
            {
                this.clear();
            }
        }
    }

    private static _lastLayerConflict = 0;

    /** Log a conflict that occurs when multiple layers render the same group. */
    private static conflict(): void
    {
        if (Group._lastLayerConflict + 5000 < Date.now())
        {
            Group._lastLayerConflict = Date.now();
            // eslint-disable-next-line max-len,no-console
            console.log(`@pixi/layers found two layers with the same group in one stage - that's not healthy. Please place a breakpoint here and debug it`);
        }
    }

    /**
     * Fired for each {@link DisplayObject} in this group, right before they are sorted.
     *
     * @event sort
     * @param {PIXI.DisplayObject} object - The object that will be sorted.
     */
}
