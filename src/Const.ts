declare module PIXI {
    export var DISPLAY_FLAG: {
        /**
         * pass through, recursively go into children
         */
        AUTO_CHILDREN: number,
        /**
         * container will handle it itself
         */
        AUTO_CONTAINER: number,
        /**
         * like DisplayObject, no children
         */
        AUTO_OBJECT: number,
        /**
         * Container will always handle rendering itself, no need to go inside
         */
        MANUAL_CONTAINER: number
    }
}

(PIXI as any).DISPLAY_FLAG = {
    AUTO_CHILDREN: 0,
    AUTO_CONTAINER: 1,
    AUTO_OBJECT: 2,
    MANUAL_CONTAINER: 3
};
