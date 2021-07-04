/* eslint-disable spaced-comment */
/// <reference path="../global.d.ts" />

import { applyDisplayMixin, applyContainerRenderMixin, applyParticleMixin } from './DisplayMixin';
import { applyRendererMixin, applyCanvasMixin, ILayeredRenderer } from './RendererMixin';
import { Renderer } from '@pixi/core';

export * from './Stage';
export * from './Layer';
export * from './Group';

export { applyDisplayMixin, applyCanvasMixin, applyContainerRenderMixin, applyRendererMixin, applyParticleMixin };
export { ILayeredRenderer };

applyDisplayMixin();
applyRendererMixin(Renderer);

/**
 * The {@link Group group} in which this display object should be rendered.
 *
 * This is provided by **@pixi/layers**.
 *
 * @memberof PIXI.DisplayObject
 * @member parentGroup
 */

/**
 * The {@link Layer layer} in which this display object should be rendered; don't set this if you're
 * using {@link PIXI.DisplayObject#parentLayer}.
 *
 * This is provided by **@pixi/layers**.
 *
 * @memberof PIXI.DisplayObject
 * @member parentLayer
 */

/**
 * Objects in a {@link Group group} are sorted by z-order. This can be used alongside PixiJS' built-in {@link PIXI.DisplayObject#zIndex zIndex}.
 *
 * If you use both {@code zIndex} and {@code zOrder}, objects will first be sorted by z-index and then @pixi/layers will
 * sort by z-order.
 *
 * This is provided by **@pixi/layers**.
 *
 * @memberof PIXI.DisplayObject
 * @member zOrder
 */
