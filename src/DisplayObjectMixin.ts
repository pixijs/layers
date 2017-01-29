declare module PIXI {
    export interface DisplayObject {
        /**
         *
         *
         * Always null for layers
         */
        displayGroup: pixi_display.Group,

        /**
         * Object will be rendered
         *
         * please specify it to handle zOrder and zIndex
         *
         * its always null for layers
         *
         */
        displayLayer: pixi_display.Layer,

        /**
         * zOrder is floating point number, distance between screen and object
         * Objects with largest zOrder will appear first in their Layer, if zOrder sorting is enabled
         * @type {number}
         */
        zOrder: number,

        /**
         * zIndex is integer number, the number of layer
         * Objects with least zOrder appear first in their Layer, if zIndex sorting is enabled
         * @type {number}
         */
        zIndex: number,

        /**
         * updateOrder is calculated by DisplayList, it is required for sorting inside DisplayGroup
         * @type {number}
         */
        updateOrder: number,

        /**
         * displayOrder is calculated by render, it is required for interaction
         * @type {number}
         */
        displayOrder: number
    }
}

(Object as any).assign(PIXI.DisplayObject.prototype, {
    displayLayer: null,
    zOrder: 0,
    zIndex: 0,
    updateOrder: 0,
    displayOrder: 0
});
