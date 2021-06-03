/**
 * A shared component for multiple DisplayObject's allows to specify rendering order for them
 *
 * @class
 * @extends EventEmitter
 * @memberof PIXI
 * @param zIndex {number} z-index for display group
 * @param sorting {boolean | Function} if you need to sort elements inside, please provide function that will set displayObject.zOrder accordingly
 */

import { DisplayObject } from '@pixi/display';
import * as utils from '@pixi/utils';
import type { Layer } from './Layer';
import type { Stage } from './Stage';

export class Group extends utils.EventEmitter
{
    static _layerUpdateId = 0;

    _activeLayer: Layer = null;

    _activeStage: Stage = null;

    _activeChildren: Array<DisplayObject> = [];

    _lastUpdateId = -1;

    useRenderTexture = false;
    useDoubleBuffer = false;
    sortPriority = 0;
    clearColor : ArrayLike<number> = new Float32Array([0, 0, 0, 0]);

    // TODO: handle orphan groups
    // TODO: handle groups that don't want to be drawn in parent
    canDrawWithoutLayer = false;
    canDrawInParentStage = true;

    /**
     * default zIndex value for layers that are created with this Group
     * @type {number}
     */
    zIndex = 0;

    enableSort = false;

    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(zIndex: number, sorting: boolean | Function)
    {
        super();

        this.zIndex = zIndex;

        this.enableSort = !!sorting;

        if (typeof sorting === 'function')
        {
            this.on('sort', sorting as any);
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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static compareZIndex(a: DisplayObject, b: DisplayObject)
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
    clear(): void
    {
        this._activeLayer = null;
        this._activeStage = null;
        this._activeChildren.length = 0;
    }

    /**
     * used only by displayList before sorting takes place
     */
    addDisplayObject(stage: Stage, displayObject: DisplayObject): void
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
     * called when corresponding layer is found in current stage
     * @param stage
     * @param layer
     */
    foundLayer(stage: Stage, layer: Layer): void
    {
        this.check(stage);
        // eslint-disable-next-line eqeqeq,no-eq-null
        if (this._activeLayer != null)
        {
            Group.conflict();
        }
        this._activeLayer = layer;
        this._activeStage = stage;
    }

    /**
     * called after stage finished the work
     * @param stage
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    foundStage(stage: Stage): void
    {
        if (!this._activeLayer && !this.canDrawInParentStage)
        {
            this.clear();
        }
    }

    check(stage: Stage): void
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

    static _lastLayerConflict = 0;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static conflict()
    {
        if (Group._lastLayerConflict + 5000 < Date.now())
        {
            Group._lastLayerConflict = Date.now();
            // eslint-disable-next-line max-len,no-console
            console.log(`PIXI-display plugin found two layers with the same group in one stage - that's not healthy. Please place a breakpoint here and debug it`);
        }
    }
}
