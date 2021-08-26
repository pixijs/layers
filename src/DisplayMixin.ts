import { DisplayObject, Container } from '@pixi/display';

/** @ignore */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function generateLayerContainerRenderMethod(originalRender: any)
{
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return function render(renderer: any): void
    {
        if (this._activeParentLayer && this._activeParentLayer !== renderer._activeLayer)
        {
            return;
        }

        if (!this.visible)
        {
            this.displayOrder = 0;

            return;
        }

        this.displayOrder = renderer.incDisplayOrder();

        // if the object is not visible or the alpha is 0 then no need to render this element
        if (this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        renderer._activeLayer = null;
        originalRender.call(this, renderer);
        renderer._activeLayer = this._activeParentLayer;
    };
}

// special case - container render method, because we want it to be faster
/**
 * @internal
 * @private
 * @ignore
 */
function containerRender(renderer: any): void
{
    if (this._activeParentLayer && this._activeParentLayer !== renderer._activeLayer)
    {
        return;
    }

    if (!this.visible)
    {
        this.displayOrder = 0;

        return;
    }

    this.displayOrder = renderer.incDisplayOrder();

    // if the object is not visible or the alpha is 0 then no need to render this element
    if (this.worldAlpha <= 0 || !this.renderable)
    {
        return;
    }

    renderer._activeLayer = null;
    this.containerRenderWebGL(renderer);
    renderer._activeLayer = this._activeParentLayer;
}

export function applyDisplayMixin(): void
{
    if (DisplayObject.prototype.displayOrder !== undefined)
    {
        return;
    }

    (Object as any).assign(DisplayObject.prototype, {
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

    const ContainerProto = Container.prototype as any;

    ContainerProto.containerRenderWebGL = ContainerProto.render;
    ContainerProto.render = containerRender;
}

/** Apply mixin to your custom Container class (not needed if using built-in {@link PIXI.Container})
 * Call it for `myClass.prototype`, not for `myClass` !
 * */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function applyContainerRenderMixin(CustomRenderContainer: any): void
{
    if (CustomRenderContainer.originalRenderWebGL)
    {
        return;
    }

    CustomRenderContainer.originalRenderWebGL = CustomRenderContainer.render;
    CustomRenderContainer.render = generateLayerContainerRenderMethod(CustomRenderContainer.render);

    if (CustomRenderContainer.renderCanvas)
    {
        CustomRenderContainer.originalRenderWebGL = CustomRenderContainer.renderCanvas;
        CustomRenderContainer.renderCanvas = generateLayerContainerRenderMethod(CustomRenderContainer.renderCanvas);
    }
}

/** Apply mixin for particles */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function applyParticleMixin(ParticleContainer: any): void
{
    ParticleContainer.prototype.layerableChildren = false;
    applyContainerRenderMixin(ParticleContainer.prototype);
}
