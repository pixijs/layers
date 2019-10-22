# pixi-layers
Allows to change rendering order of pixi containers without changing the scene graph

Works with PixiJS v5.

For PixiJS v4 please use [layers branch](https://github.com/pixijs/pixi-layers/tree/layers)

Compiled files are located in "dist" folder

**Nothing will work if you dont create Stage and set it as root. Please do it or read full explanation.**

### Examples

[Lighting example](https://pixijs.io/examples/#/plugin-layers/lighting.js)

[Z-order example](https://pixijs.io/examples/#/plugin-layers/zorder.js)

[Normals example - WORK IN PROGRESS](http://pixijs.github.io/examples/#/layers/normals.js)

[Normals with sorting - WORK IN PROGRESS](http://pixijs.github.io/examples/#/layers/normals.js)

[Double buffering - WORK IN PROGRESS](http://pixijs.github.io/examples/#/layers/trail.js)

### Migration from v4

PixiJS v5 introduced zIndex sorting: 

```js
child.zIndex = 1;
container.sortableChildren = true;
```

Therefore, to avoid any conflicts, pixi-layers sorts only by zOrder, 
and zOrder works same direction as zIndex. 

That means if you used `zIndex = sprite.y` or `zOrder = -sprite.y` in v4, now you have to use `zOrder=sprite.y`.
Or you can override group sorting function so it sorts like before.

However, you can use a hack for compatibility with v4:
```js
PIXI.display.Group.compareZIndex = function (a, b) {
   if (a.zIndex !== b.zIndex) {
       return a.zIndex - b.zIndex;
   }
   if (a.zOrder > b.zOrder) {
       return -1;
   }
   if (a.zOrder < b.zOrder) {
       return 1;
   }
   return a.updateOrder - b.updateOrder;
}
```

### Some explanations

PIXI.display.Layer extends Container

```js
var layer = new PIXI.display.Layer();
```

Pixi DisplayObject/Container can be rendered inside its layer instead of direct parent

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
console.log(layer.displayChildren);

//order of rendering: 
// bunnySprite (index=1)
// badCloudSprite (index=2, order=1)
// cloudSprite (index=2, order=0)
```

updateStage calls onSort, you can override it

```js
layer.group.on('sort', function(sprite) { sprite.zOrder = sprite.y })
```

Renderer will call "updateStage" automatically, so you can check it after render too

```js
renderer.render(stage);
console.log(layer.displayChildren);
```

Layer bounds take displayChildren into account, unless you switch that flag to false

```
layer.respectDisplayChildrenBounds = true; // its actually true by default
console.log(layer.getBounds()); // takes displayChildren bounds into account
```

When you move a character with attached sprites from different layers to a new stage, you have to change their layers.

Instead, you can create a new display Group:

```
var lightGroup = new PIXI.display.Group();

bunnySprite.parentGroup = lightGroup;
var lightLayer = new PIXI.display.Layer(lightGroup); // only one layer per stage can be bound to same group
```

Groups are working between different stages, so when you move bunny it will be rendered in its light layer.

Layer is representation of global Group in this particular stage.

### Webpack, browserify, Angular

Its a bit tricky. You have to put this thing in one of your root files that are loaded before everything else!

Make sure that you dont have two copies of pixiJS: one from html, one from browserify, it happens. You'll get strange errors like `renderer.incDisplayOrder is not a function` in that case.

```
import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import "pixi-layers"; //or require("pixi-layers")
```

### Advanced sorting

If you want sorting to affect children that have different parentLayer than their direct parent,
please set the group `sortPriority`. For now, it has two values - 0 by default and 1 for special cases.

Look at [Normals with sorting](http://pixijs.github.io/examples/#/layers/normals.js)

### The legend

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
