import { Container, DisplayObject } from '@pixi/display';
import { Layer } from './Layer';
import { Group } from './Group';

/**
 * The {@link Stage stage} manages all the layers in its scene tree.
 *
 *
 */
export class Stage extends Layer
{
    static _updateOrderCounter = 0;

    /** Flags that this is a {@link Stage stage}! */
    public readonly isStage = true;

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
    clear(): void
    {
        this._activeLayers.length = 0;
        this._tempGroups.length = 0;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    destroy(options?: any): void
    {
        this.clear();
        super.destroy(options);
    }

    /**
     * This should be called before rendering for resolving items in the scene tree to their {@link Layer layers}.
     *
     * If your scene's root is a {@link Stage}, then the {@link ILayerRenderer} mixin will automatically
     * call it.
     */
    updateStage(): void
    {
        this._activeParentStage = null;
        Group._layerUpdateId++;
        this._updateStageInner();
    }

    private updateAsChildStage(stage: Stage): void
    {
        this._activeParentStage = stage;
        Stage._updateOrderCounter = 0;
        this._updateStageInner();
    }

    private _updateStageInner(): void
    {
        this.clear();
        this._addRecursive(this);
        const layers = this._activeLayers;

        for (let i = 0; i < layers.length; i++)
        {
            const layer = layers[i];

            if (layer.group.sortPriority)
            {
                layer._onEndLayerSubtreeTraversal();
                const sorted = layer._sortedChildren;

                for (let j = 0; j < sorted.length; j++)
                {
                    this._addRecursiveChildren(sorted[j]);
                }
            }
        }

        for (let i = 0; i < layers.length; i++)
        {
            const layer = layers[i];

            if (!layer.group.sortPriority)
            {
                layer._onEndLayerSubtreeTraversal();
            }
        }
    }

    private _addRecursive(displayObject: DisplayObject): void
    {
        if (!displayObject.visible)
        {
            return;
        }

        if ((displayObject as any).isLayer)
        {
            const layer = displayObject as any as Layer;

            this._activeLayers.push(layer);
            layer._onBeginLayerSubtreeTraversal(this);
        }

        if (displayObject !== this && (displayObject as any).isStage)
        {
            const stage = displayObject as Stage;

            stage.updateAsChildStage(this);

            return;
        }

        displayObject._activeParentLayer = null;
        let group = displayObject.parentGroup;

        if (group)
        {
            group._resolveChildDisplayObject(this, displayObject);
        }
        const layer = displayObject.parentLayer;

        if (layer)
        {
            group = layer.group;
            group._resolveChildDisplayObject(this, displayObject);
        }

        displayObject.updateOrder = ++Stage._updateOrderCounter;
        if (displayObject.alpha <= 0 || !displayObject.renderable
            || !displayObject.layerableChildren
            || (group && group.sortPriority))
        {
            return;
        }

        const children = (displayObject as Container).children;

        if (children && children.length)
        {
            for (let i = 0; i < children.length; i++)
            {
                this._addRecursive(children[i]);
            }
        }
    }

    private _addRecursiveChildren(displayObject: DisplayObject): void
    {
        if (displayObject.alpha <= 0 || !displayObject.renderable
            || !displayObject.layerableChildren)
        {
            return;
        }
        const children = (displayObject as Container).children;

        if (children && children.length)
        {
            for (let i = 0; i < children.length; i++)
            {
                this._addRecursive(children[i]);
            }
        }
    }
}
