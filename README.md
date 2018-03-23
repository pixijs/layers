# pixi-layers
Allows to change rendering order of pixi containers without changing the scene graph

Its new version of "pixi-display" API, it allows to combine reordering with filters and masks

Compiled files are located in "dist" folder

Old version is in [master branch](https://github.com/pixijs/pixi-display/tree/)

### Example

[Lighting example](http://pixijs.github.io/examples/#/layers/lighting.js)

[Z-order example](http://pixijs.github.io/examples/#/layers/zorder.js)

[Normals example](http://pixijs.github.io/examples/#/layers/normals.js)

### Compatibility

Made for pixi-v4

Not compatible with v2, v3 and v5

### Some explanations

PIXI.display.Layer extends Container

```js
var layer = new PIXI.display.Layer();
```

Pixi DisplayObject/Container can be rendered inside its layer instead of direct parent

```js
bunnySprite.parentLayer = layer;
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
stage.updateStage();
console.log(layer.displayChildren);

//order of rendering: 
// bunnySprite (index=1)
// badCloudSprite (index=2, order=1)
// cloudSprite (index=2, order=0)
```

updateStage calls onSort, you can override it

```js
layer.group.on('sort', function(sprite) { sprite.zOrder = -sprite.y })
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
