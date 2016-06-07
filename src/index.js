// PIXI
//
// PIXI.DisplayGroup - фактически zIndex.
//
//     displayObject.displayGroup = new PIXI.DisplayGroup(0); - z-index , как shared компонента
//
// container.displayList = new PIXI.DisplayList(); - штука которая внутри использует эти DisplayList , как компонента
//
// container.displayOrder - номер апдейта контейнера в рендере
//
// worldDisplayGroup - берётся displaygroup от родителя
//
// displayFlag - 0 1 или 2. если 0,1 или 2 то автоматически меняется, если 3 то фиксирован
//
// событие display позволяет отследить всю хрень

var plugin = {
    DisplayGroup: require('./DisplayGroup'),
    Const: require('./Const'),
    DisplayObjectMixin: require('./DisplayObjectMixin'),
    ContainerMixin: require('./ContainerMixin')
};

var pluginMixin = {
    DisplayGroup: plugin.DisplayGroup
};

Object.assign(pluginMixin, plugin.Const);

Object.assign(PIXI.DisplayObject.prototype, plugin.DisplayObjectMixin);

Object.assign(PIXI.Container.prototype, plugin.ContainerMixin);

Object.assign(PIXI, pluginMixin);

module.exports = plugin;
