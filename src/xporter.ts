/// <reference types="pixi.js" />

namespace pixi_display {
	(PIXI as any).display = pixi_display;
}

declare module "pixi-layers" {
	export = pixi_display;
}
