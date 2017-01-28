/// <reference types="pixi.js" />
declare module PIXI {
    var DISPLAY_FLAG: {
        AUTO_CHILDREN: number;
        AUTO_CONTAINER: number;
        AUTO_OBJECT: number;
        MANUAL_CONTAINER: number;
    };
}
import WebGLRenderer = PIXI.WebGLRenderer;
import CanvasRenderer = PIXI.CanvasRenderer;
declare module PIXI {
    interface Container {
        displayList: pixi_display.DisplayList;
        displayChildren: Array<PIXI.DisplayObject>;
        updateTransform(): void;
        renderCanvas(renderer: CanvasRenderer): void;
        renderWebGL(renderer: WebGLRenderer): void;
        containerRenderWebGL(renderer: WebGLRenderer): void;
        containerRenderCanvas(renderer: CanvasRenderer): void;
    }
}
declare module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;
    import utils = PIXI.utils;
    class DisplayGroup extends utils.EventEmitter {
        computedChildren: Array<DisplayObject>;
        currentDisplayList: DisplayList;
        currentIndex: number;
        zIndex: number;
        enableSort: boolean;
        constructor(zIndex: number, sorting: boolean | Function);
        static compareZOrder(a: DisplayObject, b: DisplayObject): number;
        clear(): void;
        add(displayObject: DisplayObject): void;
        update(): void;
        renderWebGL(parentContainer: Container, renderer: WebGLRenderer): void;
        renderCanvas(parentContainer: Container, renderer: CanvasRenderer): void;
    }
}
declare module pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Container = PIXI.Container;
    import utils = PIXI.utils;
    class DisplayList extends utils.EventEmitter {
        displayGroups: Array<DisplayGroup>;
        container: Container;
        totalElements: number;
        defaultDisplayGroup: DisplayGroup;
        constructor();
        clear(): void;
        destroy(): void;
        static compareZIndex(a: DisplayGroup, b: DisplayGroup): number;
        _addRecursive(displayObject: DisplayObject, parent: Container): void;
        update(parentContainer: Container): void;
        renderWebGL(parentContainer: Container, renderer: WebGLRenderer): void;
        renderCanvas(parentContainer: Container, renderer: CanvasRenderer): void;
    }
}
declare module PIXI {
    interface DisplayObject {
        displayGroup: pixi_display.DisplayGroup;
        displayFlag: number;
        displayParent: PIXI.Container;
        zOrder: number;
        updateOrder: number;
        displayOrder: number;
    }
}
declare module pixi_display {
}
declare module PIXI {
    interface WebGLRenderer {
        _lastDisplayOrder: number;
        incDisplayOrder(): number;
    }
    interface CanvasRenderer {
        _lastDisplayOrder: number;
        incDisplayOrder(): number;
    }
}
declare module PIXI {
    var display: typeof pixi_display;
    var DisplayGroup: typeof pixi_display.DisplayGroup;
    var DisplayList: typeof pixi_display.DisplayList;
}
