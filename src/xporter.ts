declare module PIXI {
    var display: typeof pixi_display;
    var DisplayGroup: typeof pixi_display.DisplayGroup;
    var DisplayList: typeof pixi_display.DisplayList;
}

(Object as any).assign(PIXI, {
    display: pixi_display,
    DisplayGroup: pixi_display.DisplayGroup,
    DisplayList: pixi_display.DisplayList
});
