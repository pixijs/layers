/**
 * Created by ivanp on 29.01.2017.
 */

module pixi_display {
    import Container = PIXI.Container;
    import WebGLRenderer = PIXI.WebGLRenderer;
    import CanvasRenderer = PIXI.CanvasRenderer;
    import DisplayObject = PIXI.DisplayObject;
    export class Layer extends Container {
        constructor() {
            super();
        }

        isLayer = true;
        displayChildren: Array<DisplayObject> = [];
        group = new DisplayGroup(false);

        renderWebGL(renderer: WebGLRenderer) {

        }

        renderCanvas(renderer: CanvasRenderer) {

        }

        beginWork() {

        }

        endWork() {

        }

        updateDisplayLayers() {

        }

        static compareZIndex(a: DisplayObject, b: DisplayObject) {
            if (a.zIndex !== b.zIndex) {
                return a.zIndex - b.zIndex;
            }
            if (a.zOrder > b.zOrder) {
                return 1;
            }
            if (a.zOrder < b.zOrder) {
                return -1;
            }
            return a.updateOrder - b.updateOrder;
        };
    }
}
