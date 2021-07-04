declare namespace GlobalMixins {
    export interface Container {
        containerRenderWebGL?(renderer: import('@pixi/core').Renderer): void;
        containerRenderCanvas?(renderer: import('@pixi/layers').ILayeredRenderer): void;
    }

    export interface DisplayObject {
        parentGroup?: import('@pixi/layers').Group,

        /**
         * Object will be rendered
         *
         * please specify it to handle zOrder and zIndex
         *
         * its always null for layers
         *
         */
        parentLayer?: import('@pixi/layers').Layer,


        _activeParentLayer?: import('@pixi/layers').Layer,
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

        /**
         * is Layer
         */
        isLayer?: boolean;

        containsPoint?(p: import('@pixi/math').IPoint): boolean;
    }

    // need TextureSystem in pixi mixins
    // interface TextureSystem {
    //     bindForceLocation(texture: import('@pixi/core').BaseTexture, location: number): void;
    // }
}
