import { IRenderableObject, IRendererRenderOptions, Renderer } from '@pixi/core';
import { Container } from '@pixi/display';
import { LayersTreeSearch } from './LayersTreeSearch';
import { generateLayerContainerRenderMethod } from './DisplayMixin';

import type { Stage } from './Stage';
import type { Layer } from './Layer';

/**
 * Mixin applied on {@link PIXI.Renderer} when using @pixi/layers.
 */
export interface ILayeredRenderer
{
    _lastDisplayOrder: 0;
    _activeLayer: Layer;
    incDisplayOrder(): number;
    _oldRender(displayObject: IRenderableObject, options?: IRendererRenderOptions): void;
}

/** @internal */
function generateLayerRendererMethod(_oldRender: any)
{
    return function render(displayObject: IRenderableObject, options: any, arg1?: any, arg2?: any, arg3?: any)
    {
        if (!options || (!options.renderTexture && !options.baseTexture))
        {
            this._lastDisplayOrder = 0;
        }
        this._activeLayer = null;

        if ((displayObject as Stage).isStage)
        {
            (displayObject as Stage).updateStage();
        }
        if (this.plugins.interaction && !this.plugins.interaction.search.worksWithLayers)
        {
            this.plugins.interaction.search = new LayersTreeSearch();
        }

        _oldRender.call(this, displayObject, options, arg1, arg2, arg3);
    };
}

/**
 * Mixes {@link ILayeredRenderer} into {@link PIXI.Renderer}.
 *
 * This is automatically done on importing @pixi/layers.
 */
export function applyRendererMixin(rendererClass: typeof Renderer)
{
    const RendererProto = rendererClass.prototype as (Renderer & Partial<ILayeredRenderer>);

    // Skip if mixin already applied.
    if (RendererProto._oldRender)
    {
        return;
    }

    Object.assign(RendererProto, {
        _lastDisplayOrder: 0,
        _activeLayer: null,
        incDisplayOrder()
        {
            return ++this._lastDisplayOrder;
        },
        _oldRender: Renderer.prototype.render,
    });

    RendererProto._oldRender = RendererProto.render;
    RendererProto.render = generateLayerRendererMethod(RendererProto.render);
}

/**
 * Mixes renderer mixin + container mixin for canvas.
 *
 * If you are using PixiJS' canvas renderer, you'll need to invoke this manually.
 *
 * @example
 * import { CanvasRenderer } from '@pixi/canvas-renderer';
 * import { applyCanvasMixin } from '@pixi/layers';
 *
 * applyCanvasMixin(CanvasRenderer);
 */
export function applyCanvasMixin(canvasRenderClass: any): void
{
    if (!canvasRenderClass)
    {
        // eslint-disable-next-line max-len,no-console
        console.log('@pixi/layers: Canvas mixin was called with empty parameter. Are you sure that you even need this line?');

        return;
    }

    applyRendererMixin(canvasRenderClass);

    const ContainerProto = Container.prototype as any;

    if (ContainerProto.containerRenderCanvas)
    {
        return;
    }

    ContainerProto.containerRenderCanvas = ContainerProto.renderCanvas;
    ContainerProto.renderCanvas = generateLayerContainerRenderMethod(ContainerProto.renderCanvas);
}

