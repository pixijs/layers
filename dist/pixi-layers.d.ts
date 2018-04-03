/// <reference types="pixi.js" />
declare namespace PIXI {
    interface Container {
        containerRenderWebGL(renderer: WebGLRenderer): void;
        containerRenderCanvas(renderer: CanvasRenderer): void;
    }
}
declare namespace PIXI.display {
}
declare namespace PIXI {
    interface DisplayObject {
        parentGroup: PIXI.display.Group;
        parentLayer: PIXI.display.Layer;
        _activeParentLayer: PIXI.display.Layer;
        zOrder: number;
        zIndex: number;
        updateOrder: number;
        displayOrder: number;
        layerableChildren: boolean;
    }
}
declare namespace PIXI.display {
    import DisplayObject = PIXI.DisplayObject;
    import utils = PIXI.utils;
    class Group extends utils.EventEmitter {
        static _layerUpdateId: number;
        computedChildren: Array<DisplayObject>;
        _activeLayer: Layer;
        _activeStage: Stage;
        _activeChildren: Array<DisplayObject>;
        _lastUpdateId: number;
        useRenderTexture: boolean;
        useDoubleBuffer: boolean;
        sortPriority: number;
        clearColor: ArrayLike<number>;
        canDrawWithoutLayer: boolean;
        canDrawInParentStage: boolean;
        zIndex: number;
        enableSort: boolean;
        constructor(zIndex: number, sorting: boolean | Function);
        _tempResult: Array<DisplayObject>;
        _tempZero: Array<DisplayObject>;
        useZeroOptimization: boolean;
        doSort(layer: Layer, sorted: Array<DisplayObject>): void;
        static compareZIndex(a: DisplayObject, b: DisplayObject): number;
        doSortWithZeroOptimization(layer: Layer, sorted: Array<DisplayObject>): void;
        clear(): void;
        addDisplayObject(stage: Stage, displayObject: DisplayObject): void;
        foundLayer(stage: Stage, layer: Layer): void;
        foundStage(stage: Stage): void;
        check(stage: Stage): void;
        static _lastLayerConflict: number;
        static conflict(): void;
    }
}
declare namespace PIXI.display {
}
declare namespace PIXI.display {
    class LayerTextureCache {
        layer: Layer;
        constructor(layer: Layer);
        renderTexture: PIXI.RenderTexture;
        doubleBuffer: Array<PIXI.RenderTexture>;
        currentBufferIndex: number;
        _tempRenderTarget: PIXI.RenderTarget;
        initRenderTexture(renderer?: PIXI.WebGLRenderer): void;
        getRenderTexture(): PIXI.RenderTexture;
        pushTexture(renderer: PIXI.WebGLRenderer): void;
        popTexture(renderer: PIXI.WebGLRenderer): void;
        destroy(): void;
    }
    class Layer extends PIXI.Container {
        constructor(group?: Group);
        isLayer: boolean;
        group: Group;
        _activeChildren: Array<PIXI.DisplayObject>;
        _tempChildren: Array<PIXI.DisplayObject>;
        _activeStageParent: Stage;
        _sortedChildren: Array<PIXI.DisplayObject>;
        _tempLayerParent: Layer;
        textureCache: LayerTextureCache;
        insertChildrenBeforeActive: boolean;
        insertChildrenAfterActive: boolean;
        beginWork(stage: Stage): void;
        endWork(): void;
        useRenderTexture: boolean;
        useDoubleBuffer: boolean;
        clearColor: ArrayLike<number>;
        sortPriority: number;
        getRenderTexture(): PIXI.RenderTexture;
        updateDisplayLayers(): void;
        doSort(): void;
        _preRender(renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer): boolean;
        _postRender(renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer): void;
        renderWebGL(renderer: PIXI.WebGLRenderer): void;
        renderCanvas(renderer: PIXI.CanvasRenderer): void;
        destroy(options?: any): void;
    }
}
declare namespace PIXI {
    interface WebGLRenderer {
        _activeLayer: PIXI.display.Layer;
        _renderSessionId: number;
        _lastDisplayOrder: number;
        incDisplayOrder(): number;
    }
    interface CanvasRenderer {
        _activeLayer: PIXI.display.Layer;
        _renderSessionId: number;
        _lastDisplayOrder: number;
        incDisplayOrder(): number;
    }
}
declare namespace PIXI.display {
}
declare namespace PIXI.display {
    import DisplayObject = PIXI.DisplayObject;
    class Stage extends Layer {
        constructor();
        static _updateOrderCounter: number;
        isStage: boolean;
        _tempGroups: Array<DisplayObject>;
        _activeLayers: Array<Layer>;
        _activeParentStage: Stage;
        clear(): void;
        destroy(options?: any): void;
        _addRecursive(displayObject: DisplayObject): void;
        _addRecursiveChildren(displayObject: DisplayObject): void;
        _updateStageInner(): void;
        updateAsChildStage(stage: Stage): void;
        updateStage(): void;
    }
}
declare namespace PIXI.display {
}
declare module "pixi-layers" {
    export = PIXI.display;
}
