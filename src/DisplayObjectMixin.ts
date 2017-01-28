declare module PIXI {
    export interface DisplayObject {
        /**
         * please specify it to handle zOrder and zIndex
         * @type {PIXI.DisplayGroup}
         */
        displayGroup: pixi_display.DisplayGroup,

        /**
         * calculated inside displayList. Can be set to manual mode
         * @type {number}
         */
        displayFlag: number,

        /**
         * calculated inside displayList. Cleared on displayList.clear()
         * Equal to 'this' if displayGroup is specified
         * @type {PIXI.Container}
         */
        displayParent: PIXI.Container,

        /**
         * zOrder is distance between screen and object. Objects with largest zOrder will appear first in their DisplayGroup
         * @type {number}
         */
        zOrder: number,

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
    displayGroup: null,
    displayFlag: PIXI.DISPLAY_FLAG.AUTO_CHILDREN,
    displayParent: null,
    zOrder: 0,
    updateOrder: 0,
    displayOrder: 0
});
