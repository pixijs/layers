import { Container } from '@pixi/display';
import { Group } from './Group';
import { settings, Rectangle, RenderTexture, Renderer } from '@pixi/core';

import type { DisplayObject, IDestroyOptions } from '@pixi/display';
import type { Stage } from './Stage';
import type { ILayeredRenderer } from './RendererMixin';

/**
 * This manages the render-texture a {@link Layer} renders into.
 *
 * This is used internally by {@link Layer#render}.
 * @memberof PIXI.layers
 */
export class LayerTextureCache
{
    constructor(public layer: Layer) {}

    private renderTexture: RenderTexture = null;
    private doubleBuffer: Array<RenderTexture> = null;
    private currentBufferIndex = 0;
    _tempRenderTarget: RenderTexture = null;
    _tempRenderTargetSource = new Rectangle();
    _tempRenderTargetDestination = new Rectangle();

    private init(renderer?: Renderer): void
    {
        const width = renderer ? renderer.screen.width : 100;
        const height = renderer ? renderer.screen.height : 100;
        const resolution = renderer ? renderer.resolution : settings.RESOLUTION;

        this.renderTexture = RenderTexture.create({ width, height, resolution });

        if (this.layer.group.useDoubleBuffer)
        {
            this.doubleBuffer = [
                RenderTexture.create({ width, height, resolution }),
                RenderTexture.create({ width, height, resolution })
            ];
        }
    }

    /** See {@link Layer#getRenderTexture}. */
    getRenderTexture(): RenderTexture
    {
        if (!this.renderTexture)
        {
            this.init();
        }

        return this.renderTexture;
    }

    /** Prepares the layer's render-texture and set it as the render-target. */
    pushTexture(renderer: Renderer): void
    {
        // TODO: take not screen, but offset screen, in case there's matrix transform
        const screen = renderer.screen;

        if (!this.renderTexture)
        {
            this.init(renderer);
        }

        const rt = this.renderTexture;
        const group = this.layer.group;
        const db = this.doubleBuffer;

        if (rt.width !== screen.width
            || rt.height !== screen.height
            || rt.baseTexture.resolution !== renderer.resolution)
        {
            rt.baseTexture.resolution = renderer.resolution;
            rt.resize(screen.width, screen.height);

            if (db)
            {
                db[0].baseTexture.resolution = renderer.resolution;
                db[0].resize(screen.width, screen.height);
                db[1].baseTexture.resolution = renderer.resolution;
                db[1].resize(screen.width, screen.height);
            }
        }

        if (db)
        {
            db[0].framebuffer.multisample = rt.framebuffer.multisample;
            db[1].framebuffer.multisample = rt.framebuffer.multisample;
        }

        this._tempRenderTarget = renderer.renderTexture.current;
        this._tempRenderTargetSource.copyFrom(renderer.renderTexture.sourceFrame);
        this._tempRenderTargetDestination.copyFrom(renderer.renderTexture.destinationFrame);

        renderer.batch.flush();

        if (group.useDoubleBuffer)
        {
            // double-buffer logic
            let buffer = db[this.currentBufferIndex];

            if (!(buffer.baseTexture as any)._glTextures[renderer.CONTEXT_UID])
            {
                renderer.renderTexture.bind(buffer, undefined, undefined);
                renderer.texture.bind(buffer);
                if (group.clearColor)
                {
                    renderer.renderTexture.clear(group.clearColor as any);
                }
            }
            renderer.texture.unbind(rt.baseTexture);
            (rt.baseTexture as any)._glTextures = (buffer.baseTexture as any)._glTextures;
            (rt.baseTexture as any).framebuffer = (buffer.baseTexture as any).framebuffer;

            buffer = db[1 - this.currentBufferIndex];
            renderer.renderTexture.bind(buffer, undefined, undefined);
        }
        else
        {
            // simple logic
            renderer.renderTexture.bind(rt, undefined, undefined);
        }

        if (group.clearColor)
        {
            renderer.renderTexture.clear(group.clearColor as any);
        }

        // fix for filters
        const filterStack = renderer.filter.defaultFilterStack;

        if (filterStack.length > 1)
        {
            filterStack[filterStack.length - 1].renderTexture = renderer.renderTexture.current;
        }
    }

    /** Flushes the renderer and restores the old render-target. */
    popTexture(renderer: Renderer): void
    {
        renderer.batch.flush();
        renderer.framebuffer.blit();
        // switch filters back
        const filterStack = renderer.filter.defaultFilterStack;

        if (filterStack.length > 1)
        {
            filterStack[filterStack.length - 1].renderTexture = this._tempRenderTarget;
        }
        renderer.renderTexture.bind(this._tempRenderTarget,
            this._tempRenderTargetSource, this._tempRenderTargetDestination);
        this._tempRenderTarget = null;

        const rt = this.renderTexture;
        const group = this.layer.group;
        const db = this.doubleBuffer;

        if (group.useDoubleBuffer)
        {
            renderer.texture.unbind(rt.baseTexture);
            this.currentBufferIndex = 1 - this.currentBufferIndex;

            const buffer = db[this.currentBufferIndex];

            (rt.baseTexture as any)._glTextures = (buffer.baseTexture as any)._glTextures;
            (rt.baseTexture as any).framebuffer = (buffer.baseTexture as any).framebuffer;
        }
    }

    /** Destroy the texture-cache. Set {@link Layer.textureCache} to {@code null} after destroying it! */
    destroy(): void
    {
        if (this.renderTexture)
        {
            this.renderTexture.destroy();
            if (this.doubleBuffer)
            {
                this.doubleBuffer[0].destroy(true);
                this.doubleBuffer[1].destroy(true);
            }
        }
    }
}

/**
 * A {@link Layer layer} can be used to render {@link PIXI.DisplayObject}s in a different part of the scene graph together.
 *
 * A layer can be used to structure a scene graph in a data-oriented manner and separate the z-ordering hierarchy in
 * a different tree. Each layer is associated with a {@link Group} that provides the context for sorting objects
 * in the same layer.
 *
 * All layers must be placed underneath a {@link Stage} - generally, you should assign a {@link Stage} as your
 * scene's root.
 * @memberof PIXI.layers
 */
export class Layer extends Container
{
    /** Flags that this container is a layer! */
    public readonly isLayer = true;

    /** The group of {@link DisplayObject}s that are rendered within this layer */
    public group: Group = null;

    /** The texture manager used when rendering into a {@link Layer#useRenderTexture layer render-texture}. */
    public textureCache: LayerTextureCache;

    _activeChildren: Array<DisplayObject> = [];
    _tempChildren: Array<DisplayObject> = null;
    _activeStageParent: Stage = null;
    _sortedChildren: Array<DisplayObject> = [];
    _tempLayerParent: Layer = null;

    insertChildrenBeforeActive = true;
    insertChildrenAfterActive = true;

    /**
     * @param group - The group of {@link DisplayObject}s to be rendered by this layer.
     */
    constructor(group: Group = null)
    {
        super();

        if (group)
        {
            this.group = group;
            this.zIndex = group.zIndex;
        }
        else
        {
            this.group = new Group(0, false);
        }

        this._tempChildren = this.children;
    }

    /**
     * Flags whether this layer should render into a render-texture.
     *
     * This is useful if you want to use the layer as a texture elsewhere - for example, in sprites or to apply
     * filters. The layer's render-texture is resized to the size of the renderer's screen.
     */
    get useRenderTexture(): boolean
    {
        return this.group.useRenderTexture;
    }
    set useRenderTexture(value: boolean)
    {
        this.group.useRenderTexture = value;
    }

    /**
     * This will enable double buffering for this layer.
     *
     * This layer will keep two render-textures to render into - choosing one each frame on a flip-flop
     * basis. This is useful when you
     *
     * **Caveat**: You must enable {@link Layer#useRenderTexture} to prevent framebuffer errors in rendering.
     */
    get useDoubleBuffer(): boolean
    {
        return this.group.useDoubleBuffer;
    }
    set useDoubleBuffer(value: boolean)
    {
        this.group.useDoubleBuffer = value;
    }

    /**
     * The background color to clear the layer.
     *
     * This should be used when {@link Layer#useRenderTexture} is enabled.
     */
    get clearColor(): ArrayLike<number>
    {
        return this.group.clearColor;
    }
    set clearColor(value: ArrayLike<number>)
    {
        this.group.clearColor = value;
    }

    get sortPriority(): number
    {
        return this.group.sortPriority;
    }
    set sortPriority(value: number)
    {
        this.group.sortPriority = value;
    }

    /**
     * The rendering {@link Layer#useRenderTexture into a render-texture} is enabled, this will return
     * the render-texture used by this layer.
     */
    getRenderTexture(): RenderTexture
    {
        if (!this.textureCache)
        {
            this.textureCache = new LayerTextureCache(this);
        }

        return this.textureCache.getRenderTexture();
    }

    /**
     * you can override this method for this particular layer, if you want
     */
    public doSort(): void
    {
        this.group.doSort(this, this._sortedChildren);
    }

    /** @override */
    public destroy(options?: IDestroyOptions): void
    {
        if (this.textureCache)
        {
            this.textureCache.destroy();
            this.textureCache = null;
        }

        super.destroy(options);
    }

    /** @override */
    public render(renderer: Renderer): void
    {
        if (!this.prerender(renderer as any))
        {
            return;
        }

        if (this.group.useRenderTexture)
        {
            if (!this.textureCache)
            {
                this.textureCache = new LayerTextureCache(this);
            }
            this.textureCache.pushTexture(renderer);
        }

        this.containerRenderWebGL(renderer);
        this.postrender(renderer as any);

        if (this.group.useRenderTexture)
        {
            this.textureCache.popTexture(renderer);
        }
    }

    /**
     * renderCanvas named this way because of some TS mixin problem
     * @param renderer
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public layerRenderCanvas(renderer: any): void
    {
        if (this.prerender(renderer))
        {
            this.containerRenderCanvas(renderer);
            this.postrender(renderer);
        }
    }

    /**
     * This should be called when the layer is found while traversing the scene for updating object-layer association.
     *
     * This is an **internal** method.
     *
     * @see Stage#updateStage
     * @private
     */
    _onBeginLayerSubtreeTraversal(stage: Stage): void
    {
        // This will transfer all "_activeChildren" of "this.group" into "this._activeChildren". This is done
        // because a DisplayObject in that group may be placed before the layer in the scene tree.

        const active = this._activeChildren;

        this._activeStageParent = stage;
        this.group._resolveLayer(stage, this);
        const groupChildren = this.group._activeChildren;

        active.length = 0;
        for (let i = 0; i < groupChildren.length; i++)
        {
            groupChildren[i]._activeParentLayer = this;
            active.push(groupChildren[i]);
        }
        groupChildren.length = 0;
    }

    /**
     * This should be called when the full subtree of the layer has been traversed while updating the stage's scene.
     *
     * This is an **internal** method.
     *
     * @see Stage#updateStage
     * @private
     */
    _onEndLayerSubtreeTraversal(): void
    {
        const children = this.children;
        const active = this._activeChildren;
        const sorted = this._sortedChildren;

        for (let i = 0; i < active.length; i++)
        {
            this.emit('display', active[i]);
        }

        sorted.length = 0;
        if (this.insertChildrenBeforeActive)
        {
            for (let i = 0; i < children.length; i++)
            {
                sorted.push(children[i]);
            }
        }
        for (let i = 0; i < active.length; i++)
        {
            sorted.push(active[i]);
        }
        if (!this.insertChildrenBeforeActive
            && this.insertChildrenAfterActive)
        {
            for (let i = 0; i < children.length; i++)
            {
                sorted.push(children[i]);
            }
        }

        if (this.group.enableSort)
        {
            this.doSort();
        }
    }

    /**
     * Prepares the renderer for this layer.
     *
     * It will assign {@link PIXI.Renderer#_activeLayer} to {@code this}, and set the active layer before
     * this to {@link Layer#_activeParentLayer _activeParentLayer}. It will also temporarily sort the
     * children by z-order.
     *
     * @return `true`, if the layer needs to be rendered; `false`, when the layer is invisible or has
     * zero alpha.
     */
    protected prerender(renderer: ILayeredRenderer): boolean
    {
        // eslint-disable-next-line eqeqeq
        if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer)
        {
            return false;
        }

        if (!this.visible)
        {
            this.displayOrder = 0;

            return false;
        }

        this.displayOrder = renderer.incDisplayOrder();

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (this.worldAlpha <= 0 || !this.renderable)
        {
            return false;
        }

        // we are making a hack with swapping children, it can go wrong easily
        // this is special "recover" if that allows stage to recover just after failed frame

        if (this.children !== this._sortedChildren
            && this._tempChildren !== this.children)
        {
            this._tempChildren = this.children;
        }

        // just a temporary feature - getBounds() for filters will work with that
        // TODO: make a better hack for getBounds()

        (this as any)._boundsID++;
        (this as any).children = this._sortedChildren;

        this._tempLayerParent = renderer._activeLayer;
        renderer._activeLayer = this;

        return true;
    }

    /**
     * Cleans up the renderer after this layer is rendered.
     *
     * It restores {@link Renderer#_activeLayer} to the parent layer and restores the canonical
     * order of children.
     */
    protected postrender(renderer: ILayeredRenderer): void
    {
        (this as any).children = this._tempChildren;
        renderer._activeLayer = this._tempLayerParent;
        this._tempLayerParent = null;
    }
}

(Layer.prototype as any).renderCanvas = Layer.prototype.layerRenderCanvas;
