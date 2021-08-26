# @pixi/layers - PixiJS Layers Kit

[![Build](https://github.com/pixijs/layers/workflows/Build/badge.svg)](https://github.com/pixijs/layers/actions?query=workflow%3A%22Build%22) [![npm version](https://badge.fury.io/js/%40pixi%2Flayers.svg)](https://badge.fury.io/js/%40pixi%2Flayers)

This package provides an extension to scene tree - layers. These layers allows you to change
the rendering order of items in your scene without moving them around in your scene. It's like
{@link PIXI.DisplayObject#zIndex zIndex}, but supercharged.

It has been ported to PixiJS 6 since @pixi/layers 1.0.0 (formerly pixi-layers).

**Nothing will work if you dont create Stage and set it as root. Please do it or read full explanation.**

## Installation

```bash
npm install --save @pixi/layers
```

### Migration from v5

See [usage with canvas and particles](#usage-with-canvas-and-particles) part of this doc.

If you still work with PixiJS `v5` and prior - see README `pixi-v5` branch, or just use npm package `pixi-layers`

## Examples

* [Lighting example](https://pixijs.io/examples/#/plugin-layers/lighting.js)
* [Z-order example](https://pixijs.io/examples/#/plugin-layers/zorder.js)
* [Double buffering](http://pixijs.github.io/examples/#/layers/trail.js)
* [Normals example - WORK IN PROGRESS](http://pixijs.github.io/examples/#/layers/normals.js)
* [Normals with sorting - WORK IN PROGRESS](http://pixijs.github.io/examples/#/layers/normals.js)

## Usage

{@link Layer} extends {@link PIXI.Container}:

```js
import { Layer } from '@pixi/layers'

let layer = new Layer();
```

A DisplayObject/Container can be rendered inside its layer instead of direct parent

```js
bunnySprite.parentLayer = layer;
```

Layer can order elements inside of it, by zOrder increase

```js
bunnySprite.zOrder = 2;
cloudSprite.zOrder = 1;
badCloudSprite.zOrder = 1.01;
layer.group.enableSort = true;
```

You can check which objects were picked up into layer

```js
stage.updateStage();
console.log(layer._sortedChildren);

// Order of rendering: 
//   bunnySprite (index=1)
//   badCloudSprite (index=2, order=1)
//   cloudSprite (index=2, order=0)
```

{@link Group} sorts its items after emitting the {@link Group#sort} event for each item. You
can intercept it and set the z-order on each item.

```js
layer.group.on('sort', function onWillSort(sprite) {
    sprite.zOrder = sprite.y 
});
```

@pixi/layer applies a mixin on {@link PIXI.Renderer} so it calls "updateStage" automatically if you use a {@link Stage}
for your scene's root, so you can check it after render too:

```js
renderer.render(stage);
console.log(layer._sortedChildren);
```


When you move a character with attached sprites from different layers to a new stage, you have to change their layers.

Instead, you can create a new display Group:

```
let lightGroup = new Group();

bunnySprite.parentGroup = lightGroup;
let lightLayer = new Layer(lightGroup); // only one layer per stage can be bound to same group
```

Groups are working between different stages, so when you move bunny it will be rendered in its light layer.

Layer is representation of global Group in this particular stage.

## Vanilla JS, UMD build

All pixiJS v6 plugins has special `umd` build suited for vanilla.   
Navigate `pixi-layers` npm package, take `dist/pixi-layers.umd.js` file.

```html
<script src='lib/pixi.js'></script>
<script src='lib/pixi-layers.umd.js'></script>
```

```js
let layer = new PIXI.display.Layer();
```

## Usage with canvas and particles

Due to changes in PixiJS architecture that allowed to build custom bundles, certain operations has to be called from your bundle or from your app.

The important thing is to call it when you know that corresponding module is loaded. You can call it multiple times if you are not sure :) Welcome to es6 imports!

If you use `@pixi/canvas-renderer`

```js
import * as PIXI from 'pixi.js-legacy';
import { applyCanvasMixin } from '@pixi/layers';

applyCanvasMixin(PIXI.CanvasRenderer);
```

If you use `@pixi/particles`

```js
import * as PIXI from 'pixi.js';
import { applyCanvasMixin } from '@pixi/layers';

applyParticleMixin(PIXI.ParticleContainer);
```

## Advanced sorting

If you want sorting to affect children that have different parentLayer than their direct parent,
please set the group `sortPriority`. For now, it has two values - 0 by default and 1 for special cases.

Look at [Normals with sorting](http://pixijs.github.io/examples/#/layers/normals.js)

## Important notice about filters

If you add filters to layer, or use layer itself as a mask - it might not work!

The reason is that layer `getBounds()` does not take into account its active children.

If you use filters on layer, there are three ways:
1. add a filterArea, its global screen rect for filters, `layer.filterArea = renderer.screen`.
2. works with both: Add a child graphics rect of certain size with alpha=0
3. if you know how to pixi: override `calculateBounds` that way it takes `_activeChildren` into account.

If you use layer as a stencil mask (render all graphics inside it, only ways 2 and 3 can work.

## The legend

Stage is the city. Containers are buildings, simple sprites are people.

Layers are office buildings. Office for googlers, office for bakers, office for account workers.

Groups are occupation. If there's a googler, he's looking for google office in the same town.

In render stage, some people are going to their offices and arrange by z-order/z-index/their rank in corporation.

People who dont have occupation or office are working from home. And some people are actually living in offices, that happens ;)

We can combine multiple Stage's into each other, like downtown, and child suburbs.
 
In that case, people will look for offices in the same suburb, and if they dont find it, they'll go search one in the downtown.

The only problem with this legend is that "people" and "buildings" are actually the same ;) 
Whole building can be "home for googlers", but one person in it has its own occupation, he's from Yandex.
It happens.

### Pros

1. compatible with other implementations: does not change "container.children" order
2. faster than just sorting: if there are 1000 elements with the same z-index, you can create extra Layer for them, and they wont be compared with each other
3. Compared to pixi-display it doesn't care about filters or masks, they just work. You can use them to add lighting effects to the stage.

### Cons

1. Interaction is different, there might be bugs. Performance of processInteractive() can drop a bit.
2. Non-renderable elements are not interactable. Elements with alpha=0 are interactable but their children are not.
3. Plugin does not support new `@pixi/events` package yet.

## How to build

```bash
npm install
npm run build
```
