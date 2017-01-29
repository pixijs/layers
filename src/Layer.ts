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

        _renderSessionId = 0;
        displayChildren: Array<DisplayObject> = [];

        renderWebGL(renderer: WebGLRenderer) {

        }

        renderCanvas(renderer: CanvasRenderer) {

        }
    }
}
