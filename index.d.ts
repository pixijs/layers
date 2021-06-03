/// <reference path="./global.d.ts" />

import { Container } from '@pixi/display';
import { DisplayObject } from '@pixi/display';
import { IRenderableObject } from '@pixi/core';
import { IRendererRenderOptions } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import { RenderTexture } from '@pixi/core';
import * as utils from '@pixi/utils';

export declare function applyCanvasMixin(canvasRenderClass: any): void;

export declare function applyContainerRenderMixin(CustomRenderContainer: any): void;

export declare function applyDisplayMixin(): void;

export declare function applyParticleMixin(ParticleContainer: any): void;

export declare function applyRendererMixin(rendererClass: any): void;

export declare class Group extends utils.EventEmitter {
    static _layerUpdateId: number;
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
    doSort(layer: Layer, sorted: Array<DisplayObject>): void;
    static compareZIndex(a: DisplayObject, b: DisplayObject): number;
    clear(): void;
    addDisplayObject(stage: Stage, displayObject: DisplayObject): void;
    foundLayer(stage: Stage, layer: Layer): void;
    foundStage(stage: Stage): void;
    check(stage: Stage): void;
    static _lastLayerConflict: number;
    static conflict(): void;
}

export declare interface ILayeredRenderer {
    _lastDisplayOrder: 0;
    _activeLayer: Layer;
    incDisplayOrder(): number;
    _oldRender(displayObject: IRenderableObject, options?: IRendererRenderOptions): void;
}

export declare class Layer extends Container {
    constructor(group?: Group);
    isLayer: boolean;
    group: Group;
    _activeChildren: Array<DisplayObject>;
    _tempChildren: Array<DisplayObject>;
    _activeStageParent: Stage;
    _sortedChildren: Array<DisplayObject>;
    _tempLayerParent: Layer;
    textureCache: LayerTextureCache;
    insertChildrenBeforeActive: boolean;
    insertChildrenAfterActive: boolean;
    beginWork(stage: Stage): void;
    endWork(): void;
    get useRenderTexture(): boolean;
    set useRenderTexture(value: boolean);
    get useDoubleBuffer(): boolean;
    set useDoubleBuffer(value: boolean);
    get clearColor(): ArrayLike<number>;
    set clearColor(value: ArrayLike<number>);
    get sortPriority(): number;
    set sortPriority(value: number);
    getRenderTexture(): RenderTexture;
    doSort(): void;
    _preRender(renderer: ILayeredRenderer): boolean;
    _postRender(renderer: ILayeredRenderer): void;
    render(renderer: Renderer): void;
    destroy(options?: any): void;
}

export declare class LayerTextureCache {
    layer: Layer;
    constructor(layer: Layer);
    renderTexture: RenderTexture;
    doubleBuffer: Array<RenderTexture>;
    currentBufferIndex: number;
    _tempRenderTarget: RenderTexture;
    _tempRenderTargetSource: Rectangle;
    initRenderTexture(renderer?: Renderer): void;
    getRenderTexture(): RenderTexture;
    pushTexture(renderer: Renderer): void;
    popTexture(renderer: Renderer): void;
    destroy(): void;
}

export declare class Stage extends Layer {
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

export { }
