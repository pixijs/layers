var plugin = {
    DisplayGroup: require('./DisplayGroup'),
    DisplayList: require('./DisplayList'),
    Const: require('./Const'),
    DisplayObjectMixin: require('./DisplayObjectMixin'),
    ContainerMixin: require('./ContainerMixin'),
    SystemRendererMixin: require('./SystemRendererMixin'),
    WebGLRendererMixin: require('./WebGLRendererMixin'),
    CanvasRendererMixin: require('./CanvasRendererMixin'),
    InteractionManagerMixin: require('./InteractionManagerMixin')
};

var pluginMixin = {
    DisplayGroup: plugin.DisplayGroup,
    DisplayList: plugin.DisplayList
};

Object.assign(pluginMixin, plugin.Const);

Object.assign(PIXI.DisplayObject.prototype, plugin.DisplayObjectMixin);

Object.assign(PIXI.Container.prototype, plugin.ContainerMixin);

Object.assign(PIXI.WebGLRenderer.prototype, plugin.SystemRendererMixin, plugin.WebGLRendererMixin);

Object.assign(PIXI.CanvasRenderer.prototype, plugin.SystemRendererMixin, plugin.CanvasRendererMixin);

Object.assign(PIXI.interaction.InteractionManager.prototype, plugin.InteractionManagerMixin);

Object.assign(PIXI, pluginMixin);

module.exports = plugin;
