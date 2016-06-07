var Const = {
    /**
     * controls RenderList behaviour. AUTO_ will be assigned by renderlist itself
     */
    DISPLAY_FLAG: {
        /**
         * pass through, recursively go into children
         */
        AUTO_CHILDREN: 0,
        /**
         * container will handle it itself
         */
        AUTO_CONTAINER: 1,
        /**
         * like DisplayObject, no children
         */
        AUTO_OBJECT: 2,
        /**
         * Container will always handle rendering itself, no need to go inside
         */
        MANUAL_CONTAINER: 3
    }
};

module.exports = Const;
