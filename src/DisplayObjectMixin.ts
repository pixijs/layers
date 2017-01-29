declare module PIXI {
    export interface DisplayObject {
        /**
         *
         *
         * Always null for layers
         */
        parentGroup: pixi_display.DisplayGroup,

        /**
         * Object will be rendered
         *
         * please specify it to handle zOrder and zIndex
         *
         * its always null for layers
         *
         */
        parentLayer: pixi_display.Layer,

        /**
         * zOrder is floating point number, distance between screen and object
         * Objects with largest zOrder will appear first in their Layer, if zOrder sorting is enabled
         */
        zOrder: number,

        /**
         * zIndex is integer number, the number of layer
         * Objects with least zOrder appear first in their Layer, if zIndex sorting is enabled
         */
        zIndex: number,

        /**
         * updateOrder is calculated by DisplayList, it is required for sorting inside DisplayGroup
         */
        updateOrder: number,

        /**
         * displayOrder is calculated by render, it is required for interaction
         */
        displayOrder: number,

        /**
         * Stage will look inside for elements that can be re-arranged, if this flag is true
         * Make it false for ParticleContainer
         */
        layerableChildren: boolean
    }
}

(Object as any).assign(PIXI.DisplayObject.prototype, {
    parentLayer: null,
    parentGroup: null,
    zOrder: 0,
    zIndex: 0,
    updateOrder: 0,
    displayOrder: 0,
    layerableChildren: true
});

if (PIXI.particles.ParticleContainer) {
    PIXI.particles.ParticleContainer.prototype.layerableChildren = false;
}