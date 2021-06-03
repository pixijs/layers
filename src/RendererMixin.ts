import { IRenderableObject, IRendererRenderOptions, Renderer } from '@pixi/core';
import { Container, DisplayObject } from '@pixi/display';
import { LayersTreeSearch } from './LayersTreeSearch';
import { generateLayerContainerRenderMethod } from './DisplayMixin';
import type { Stage } from './Stage';
import type { Layer } from './Layer';

export interface ILayeredRenderer
{
    _lastDisplayOrder: 0;
    _activeLayer: Layer;
    incDisplayOrder(): number;
    _oldRender(displayObject: IRenderableObject, options?: IRendererRenderOptions): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateLayerRendererMethod(_oldRender: any)
{
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return function render(displayObject: DisplayObject, options: any, arg1: any, arg2: any, arg3: any)
    {
        if (!options || (options.renderTexture || options.baseTexture))
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function applyRendererMixin(rendererClass: any)
{
    const RendererProto = rendererClass.prototype;

    if (RendererProto._oldRender)
    {
        return;
    }

    (Object as any).assign(RendererProto, {
        _lastDisplayOrder: 0,
        _activeLayer: null,
        incDisplayOrder()
        {
            return ++this._lastDisplayOrder;
        },
        _oldRender: Renderer.prototype.render,
    });

    RendererProto._oldRender = RendererProto.render;
    RendererProto._oldRender = generateLayerRendererMethod(RendererProto.render);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function applyCanvasMixin(canvasRenderClass: any): void
{
    const ContainerProto = Container.prototype as any;

    if (ContainerProto.containerRenderCanvas)
    {
        return;
    }
    ContainerProto.containerRenderCanvas = ContainerProto.renderCanvas;
    ContainerProto.renderCanvas = generateLayerContainerRenderMethod(ContainerProto.renderCanvas);

    applyRendererMixin(canvasRenderClass);
}

