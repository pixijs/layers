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
