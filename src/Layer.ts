/**
 * Created by ivanp on 29.01.2017.
 */

import { RenderTexture, Renderer } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { Container, DisplayObject } from '@pixi/display';
import { Group } from './Group';
import type { Stage } from './Stage';
import type { ILayeredRenderer } from './RendererMixin';

export class LayerTextureCache
{
    constructor(public layer: Layer)
    {
    }

    renderTexture: RenderTexture = null;
    doubleBuffer: Array<RenderTexture> = null;
    currentBufferIndex = 0;
    _tempRenderTarget: RenderTexture = null;
    _tempRenderTargetSource = new Rectangle();

    initRenderTexture(renderer?: Renderer): void
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

    getRenderTexture(): RenderTexture
    {
        if (!this.renderTexture)
        {
            this.initRenderTexture();
        }

        return this.renderTexture;
    }

    pushTexture(renderer: Renderer): void
    {
        // TODO: take not screen, but offset screen, in case there's matrix transform
        const screen = renderer.screen;

        if (!this.renderTexture)
        {
            this.initRenderTexture(renderer);
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
        renderer.renderTexture.bind(this._tempRenderTarget, this._tempRenderTargetSource, undefined);
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

export class Layer extends Container
{
    constructor(group: Group = null)
    {
        super();
        // eslint-disable-next-line eqeqeq,no-eq-null
        if (group != null)
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

    isLayer = true;
    group: Group = null;
    _activeChildren: Array<DisplayObject> = [];
    _tempChildren: Array<DisplayObject> = null;
    _activeStageParent: Stage = null;
    _sortedChildren: Array<DisplayObject> = [];
    _tempLayerParent: Layer = null;

    textureCache: LayerTextureCache;
    insertChildrenBeforeActive = true;
    insertChildrenAfterActive = true;

    beginWork(stage: Stage): void
    {
        const active = this._activeChildren;

        this._activeStageParent = stage;
        this.group.foundLayer(stage, this);
        const groupChildren = this.group._activeChildren;

        active.length = 0;
        for (let i = 0; i < groupChildren.length; i++)
        {
            groupChildren[i]._activeParentLayer = this;
            active.push(groupChildren[i]);
        }
        groupChildren.length = 0;
    }

    endWork(): void
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

    get useRenderTexture(): boolean
    {
        return this.group.useRenderTexture;
    }

    set useRenderTexture(value: boolean)
    {
        this.group.useRenderTexture = value;
    }

    get useDoubleBuffer(): boolean
    {
        return this.group.useDoubleBuffer;
    }

    set useDoubleBuffer(value: boolean)
    {
        this.group.useDoubleBuffer = value;
    }

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
    doSort(): void
    {
        this.group.doSort(this, this._sortedChildren);
    }

    _preRender(renderer: ILayeredRenderer): boolean
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

    _postRender(renderer: ILayeredRenderer): void
    {
        (this as any).children = this._tempChildren;
        renderer._activeLayer = this._tempLayerParent;
        this._tempLayerParent = null;
    }

    render(renderer: Renderer): void
    {
        if (!this._preRender(renderer as any))
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
        this._postRender(renderer as any);

        if (this.group.useRenderTexture)
        {
            this.textureCache.popTexture(renderer);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    destroy(options?: any): void
    {
        if (this.textureCache)
        {
            this.textureCache.destroy();
            this.textureCache = null;
        }
        super.destroy(options);
    }
}

(Layer.prototype as any).renderCanvas = function renderCanvas(renderer: ILayeredRenderer)
{
    if (this._preRender(renderer))
    {
        this.containerRenderCanvas(renderer);
        this._postRender(renderer);
    }
};
