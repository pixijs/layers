# pixi-display
Allows to change rendering order of pixi-v4 containers without changing the scene graph

Compiled files are located in "bin" folder

### Example

Please look at [example](http://pixijs.github.io/examples/#/display/zorder.js)

### Some explanations

1. create some DisplayGroup , each has a z-index
2. assign them to some of displayObjects (as shared component)
3. assign displayList to root container (as a component)
4. Displaylist looks inside subtree and sorts all the displaygroups that appear there, also calculated the list of elements that appear inside every DisplayGroup
5. all objects that don't have displayGroup are added in "displayChildren" list of first parent that has it a displayGroup.
6. inside each DisplayGroup you can specify sorting algorithm, if it is needed. (sort by y-coord or something like that)
7. DisplayList -> DisplayGroups -> containers -> DisplayChildrens

As a result, every object will have a DisplayFlag:

0. AUTO_CHILDREN - its children can appear in other display groups, so we render only self _renderWebGL
1. AUTO_CONTAINER - have mask or filters, renders whole subtree renderWebGL
2. AUTO_OBJECT - no children. thus, renderWebGL will be called
3. MANUAL_CONTAINER - Specified by user. Its a particle container. Call renderWebGL and dont even try to check childrens, for performance.

### Pros

1. compatible with other implementations: just assign each element its own DisplayGroup. All elements will be sorted
2. optimized for cases when you already know that 1000 elements have the same z-index: just assign them the same DisplayGroup
3. optimized for cases when you know that some displayObjects follow natural order of things (rendered just after parent)
4. optimized for cases like "ParticleContainer", you can set special DisplayFlag to container that way displayList will consider it a "leaf" and dont check its children at all.

### Cons

1. Interaction is different, there might be bugs. Performance of processInteractive() can drop a bit.
2. Non-renderable elements are not interactable. Elements with alpha=0 are interactable but their children are not.
