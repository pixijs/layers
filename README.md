# pixi-layers
Allows to change rendering order of pixi-v4 containers without changing the scene graph

Its new version of "pixi-display" API, it allows to combine reordering with filters and masks

Compiled files are located in "bin" folder

### Example

[Lighting example](http://pixijs.github.io/examples/#/layers/multiply.js)

[Groups example](http://pixijs.github.io/examples/#/layers/groups.js)

[Z-order example](http://pixijs.github.io/examples/#/layers/zorder.js)


### Some explanations

PIXI.display.Layer extends Container

```js
var layer = new PIXI.display.Layer();
```

Pixi DisplayObject/Container can be rendered inside its layer instead of direct parent

```js
bunnySprite.displayLayer = layer;
```

Layer can order elements inside of it, by zIndex increase and then by zOrder decrease

```js
bunnySprite.zIndex = 1;
cloudSprite.zIndex = 2;
badCloudSprite.zIndex = 2;
badCloudSprite.zOrder = 1;
layer.group.enableSort = true;
```

You can check which objects were picked up into layer

```js
stage.updateDisplayLayers();
console.log(layer.displayChildren);

//order of rendering: 
// bunnySprite (index=1)
// badCloudSprite (index=2, order=1)
// cloudSprite (index=2, order=0)
```

updateDisplayLayers calls onSort, you can override it

```js
layer.group.onSort = function(sprite, layer) { sprite.zOrder = -sprite.y }
```

Renderer will call "updateDisplayLayers" automatically, so you can check it after render too

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
var lightGroup = new PIXI.display.DisplayGroup();

bunnySprite.displayGroup = lightGroup;
lightLayer.displayGroup = lightGroup; // only one layer per stage can be bound to same group
```

Groups are working between different stages, so when you move bunny it will be rendered in its light layer.

### Pros

1. compatible with other implementations: does not change "container.children" order
2. faster than just sorting: if there are 1000 elements with the same z-index, you can create extra Layer for them, and they wont be compared with each other
3. Compared to pixi-display it doesn't care about filters or masks, they just work. You can use them to add lighting effects to the stage.

### Cons

1. Interaction is different, there might be bugs. Performance of processInteractive() can drop a bit.
2. Non-renderable elements are not interactable. Elements with alpha=0 are interactable but their children are not.
