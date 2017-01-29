declare module PIXI {
    var display: typeof pixi_display;
}

(Object as any).assign(PIXI, {
    display: pixi_display
});
