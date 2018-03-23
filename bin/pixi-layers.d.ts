/// <reference types="pixi.js" />
declare module PIXI {
    interface Container {
        containerRenderWebGL(renderer: WebGLRenderer): void;
        containerRenderCanvas(renderer: CanvasRenderer): void;
    }
}
declare module pixi_display {
}
declare module PIXI {
    interface DisplayObject {
        parentGroup: pixi_display.Group;
        parentLayer: pixi_display.Layer;
        _activeParentLayer: pixi_display.Layer;
        zOrder: number;
        zIndex: number;
        updateOrder: number;
        displayOrder: number;
        layerableChildren: boolean;
    }
}
declare module pixi_display {
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
declare module pixi_display {
}
declare module pixi_display {
    import Container = PIXI.Container;
    import WebGLRenderer = PIXI.WebGLRenderer;
    import CanvasRenderer = PIXI.CanvasRenderer;
    import DisplayObject = PIXI.DisplayObject;
    class Layer extends Container {
        constructor(group?: Group);
        isLayer: boolean;
        group: Group;
        _activeChildren: Array<DisplayObject>;
        _tempChildren: Array<DisplayObject>;
        _activeStageParent: Stage;
        _sortedChildren: Array<DisplayObject>;
        _tempLayerParent: Layer;
        _thisRenderTexture: PIXI.RenderTexture;
        _tempRenderTarget: PIXI.RenderTarget;
        insertChildrenBeforeActive: boolean;
        insertChildrenAfterActive: boolean;
        beginWork(stage: Stage): void;
        endWork(): void;
        useRenderTexture: boolean;
        clearColor: ArrayLike<number>;
        getRenderTexture(): PIXI.RenderTexture;
        updateDisplayLayers(): void;
        doSort(): void;
        _preRender(renderer: WebGLRenderer | CanvasRenderer): boolean;
        _postRender(renderer: WebGLRenderer | CanvasRenderer): void;
        _pushTexture(renderer: WebGLRenderer): void;
        _popTexture(renderer: WebGLRenderer): void;
        renderWebGL(renderer: WebGLRenderer): void;
        renderCanvas(renderer: CanvasRenderer): void;
        destroy(options: any): void;
    }
}
declare module PIXI {
    import Layer = pixi_display.Layer;
    interface WebGLRenderer {
        _activeLayer: Layer;
        _renderSessionId: number;
        _lastDisplayOrder: number;
        incDisplayOrder(): number;
    }
    interface CanvasRenderer {
        _activeLayer: Layer;
        _renderSessionId: number;
        _lastDisplayOrder: number;
        incDisplayOrder(): number;
    }
}
declare module pixi_display {
}
declare module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import DestroyOptions = PIXI.DestroyOptions;
    class Stage extends Layer {
        constructor();
        static _updateOrderCounter: number;
        isStage: boolean;
        _tempGroups: Array<DisplayObject>;
        _activeLayers: Array<Layer>;
        _activeParentStage: Stage;
        clear(): void;
        destroy(options?: DestroyOptions | boolean): void;
        _addRecursive(displayObject: DisplayObject): void;
        _updateStageInner(): void;
        updateAsChildStage(stage: Stage): void;
        updateStage(): void;
    }
}
declare module PIXI {
    var display: typeof pixi_display;
}
