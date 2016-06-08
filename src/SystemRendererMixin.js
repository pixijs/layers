/**
 * @mixin
 */
var SystemRendererMixin = {
    /**
     * @private
     * @type {number}
     */
    _lastDisplayOrder: 0,

    /**
     * gets new display order for container/displayobject
     */
    incDisplayOrder: function() {
        return ++this._lastDisplayOrder;
    }
};

module.exports = SystemRendererMixin;
