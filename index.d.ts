/// <reference path="./global.d.ts" />

import { Container } from '@pixi/display';
import { DisplayObject } from '@pixi/display';
import type { IDestroyOptions } from '@pixi/display';
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

export declare function applyRendererMixin(rendererClass: typeof Renderer): void;

export declare class Group extends utils.EventEmitter {
    static _layerUpdateId: number;
    useRenderTexture: boolean;
    useDoubleBuffer: boolean;
    sortPriority: number;
    clearColor: ArrayLike<number>;
    canDrawWithoutLayer: boolean;
    canDrawInParentStage: boolean;
    zIndex: number;
    enableSort: boolean;
    private _activeLayer;
    private _activeStage;
    _activeChildren: Array<DisplayObject>;
    private _lastUpdateId;
    constructor(zIndex?: number, sorting?: boolean | ((displayObject: DisplayObject) => void));
    doSort(layer: Layer, sorted: Array<DisplayObject>): void;
    private static compareZIndex;
    private clear;
    _resolveChildDisplayObject(stage: Stage, displayObject: DisplayObject): void;
    _resolveLayer(stage: Stage, layer: Layer): void;
    private check;
    private static _lastLayerConflict;
    private static conflict;
}

export declare interface ILayeredRenderer {
    _lastDisplayOrder: number;
    _activeLayer: Layer;
    incDisplayOrder(): number;
    _oldRender(displayObject: IRenderableObject, options?: IRendererRenderOptions): void;
}

export declare class Layer extends Container {
    readonly isLayer = true;
    group: Group;
    textureCache: LayerTextureCache;
    _activeChildren: Array<DisplayObject>;
    _tempChildren: Array<DisplayObject>;
    _activeStageParent: Stage;
    _sortedChildren: Array<DisplayObject>;
    _tempLayerParent: Layer;
    insertChildrenBeforeActive: boolean;
    insertChildrenAfterActive: boolean;
    constructor(group?: Group);
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
    destroy(options?: IDestroyOptions): void;
    render(renderer: Renderer): void;
    renderCanvas(renderer: any): void;
    _onBeginLayerSubtreeTraversal(stage: Stage): void;
    _onEndLayerSubtreeTraversal(): void;
    protected prerender(renderer: ILayeredRenderer): boolean;
    protected postrender(renderer: ILayeredRenderer): void;
}

export declare class LayerTextureCache {
    layer: Layer;
    constructor(layer: Layer);
    private renderTexture;
    private doubleBuffer;
    private currentBufferIndex;
    _tempRenderTarget: RenderTexture;
    _tempRenderTargetSource: Rectangle;
    _tempRenderTargetDestination: Rectangle;
    private init;
    getRenderTexture(): RenderTexture;
    pushTexture(renderer: Renderer): void;
    popTexture(renderer: Renderer): void;
    destroy(): void;
}

export declare class Stage extends Layer {
    static _updateOrderCounter: number;
    readonly isStage = true;
    _tempGroups: Array<DisplayObject>;
    _activeLayers: Array<Layer>;
    _activeParentStage: Stage;
    clear(): void;
    destroy(options?: any): void;
    updateStage(): void;
    private updateAsChildStage;
    private _updateStageInner;
    private _addRecursive;
    private _addRecursiveChildren;
}

export { }
