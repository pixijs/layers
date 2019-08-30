declare namespace PIXI {
    export interface DisplayObject {
        parentGroup: pixi_display.Group,

        /**
         * Object will be rendered
         *
         * please specify it to handle zOrder and zIndex
         *
         * its always null for layers
         *
         */
        parentLayer?: pixi_display.Layer,


        _activeParentLayer?: pixi_display.Layer,
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
    layerableChildren: true
});

if (PIXI.ParticleContainer) {
    PIXI.ParticleContainer.prototype.layerableChildren = false;
}
else if ((PIXI as any).ParticleContainer) {
    (PIXI as any).ParticleContainer.prototype.layerableChildren = false;
}
