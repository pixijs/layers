/**
 * Created by ivanp on 29.01.2017.
 */

namespace pixi_display {
	export class Layer extends PIXI.Container {
		constructor(group: Group = null) {
			super();
			if (group != null) {
				this.group = group;
				this.zIndex = group.zIndex;
			} else {
				this.group = new Group(0, false);
			}
			this._tempChildren = this.children;
		}

		isLayer = true;
		group: Group = null;
		_activeChildren: Array<PIXI.DisplayObject> = [];
		_tempChildren: Array<PIXI.DisplayObject> = null;
		_activeStageParent: Stage = null;
		_sortedChildren: Array<PIXI.DisplayObject> = [];
		_tempLayerParent: Layer = null;
		_thisRenderTexture: PIXI.RenderTexture = null;
		_tempRenderTarget: PIXI.RenderTarget = null;

		insertChildrenBeforeActive = true;
		insertChildrenAfterActive = true;

		beginWork(stage: Stage) {
			const active = this._activeChildren;
			this._activeStageParent = stage;
			this.group.foundLayer(stage, this);
			const groupChildren = this.group._activeChildren;
			active.length = 0;
			for (let i = 0; i < groupChildren.length; i++) {
				groupChildren[i]._activeParentLayer = this;
				active.push(groupChildren[i]);
			}
			groupChildren.length = 0;
		}

		endWork() {
			const children = this.children;
			const active = this._activeChildren;
			const sorted = this._sortedChildren;

			for (let i = 0; i < active.length; i++) {
				this.emit("display", active[i])
			}

			sorted.length = 0;
			if (this.insertChildrenBeforeActive) {
				for (let i = 0; i < children.length; i++) {
					sorted.push(children[i]);
				}
			}
			for (let i = 0; i < active.length; i++) {
				sorted.push(active[i]);
			}
			if (!this.insertChildrenBeforeActive &&
				this.insertChildrenAfterActive) {
				for (let i = 0; i < children.length; i++) {
					sorted.push(children[i]);
				}
			}

			if (this.group.enableSort) {
				this.doSort();
			}
		}

		get useRenderTexture() {
			return this.group.useRenderTexture;
		}

		set useRenderTexture(value: boolean) {
			this.group.useRenderTexture = value;
		}

		get clearColor() {
			return this.group.clearColor;
		}

		set clearColor(value: ArrayLike<number>) {
			this.group.clearColor = value;
		}

		getRenderTexture() {
			if (!this._thisRenderTexture) {
				this._thisRenderTexture = PIXI.RenderTexture.create(100, 100);
			}
			return this._thisRenderTexture;
		}

		updateDisplayLayers() {

		}

		/**
		 * you can override this method for this particular layer, if you want
		 */
		doSort() {
			this.group.doSort(this, this._sortedChildren);
		}

		_preRender(renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer): boolean {
			if (this._activeParentLayer && this._activeParentLayer != renderer._activeLayer) {
				return false;
			}

			if (!this.visible) {
				this.displayOrder = 0;
				return false;
			}

			this.displayOrder = renderer.incDisplayOrder();

			// if the object is not visible or the alpha is 0 then no need to render this element
			if (this.worldAlpha <= 0 || !this.renderable) {
				return false;
			}

			// we are making a hack with swapping children, it can go wrong easily
			// this is special "recover" if that allows stage to recover just after failed frame

			if (this.children !== this._sortedChildren &&
				this._tempChildren != this.children) {
				this._tempChildren = this.children;
			}

			//just a temporary feature - getBounds() for filters will work with that
			//TODO: make a better hack for getBounds()

			this._boundsID++;
			this.children = this._sortedChildren;

			this._tempLayerParent = renderer._activeLayer;
			renderer._activeLayer = this;
			return true;
		}

		_postRender(renderer: PIXI.WebGLRenderer | PIXI.CanvasRenderer) {
			this.children = this._tempChildren;
			renderer._activeLayer = this._tempLayerParent;
			this._tempLayerParent = null;
		}

		_pushTexture(renderer: PIXI.WebGLRenderer) {
			const screen = renderer.screen;

			if (!this._thisRenderTexture) {
				this._thisRenderTexture = PIXI.RenderTexture.create(screen.width, screen.height, null, renderer.resolution);
			}

			const rt = this._thisRenderTexture;

			if (rt.width !== screen.width ||
				rt.height !== screen.height ||
				rt.baseTexture.resolution !== renderer.resolution) {
				rt.baseTexture.resolution = renderer.resolution;
				rt.resize(screen.width, screen.height);
			}

			this._tempRenderTarget = renderer._activeRenderTarget;

			renderer.currentRenderer.flush();
			renderer.bindRenderTexture(rt, undefined);
			if (this.group.clearColor) {
				renderer.clear(this.group.clearColor as any);
			}
		}

		_popTexture(renderer: PIXI.WebGLRenderer) {
			renderer.currentRenderer.flush();
			renderer.bindRenderTarget(this._tempRenderTarget);
			this._tempRenderTarget = null;
		}

		renderWebGL(renderer: PIXI.WebGLRenderer) {
			if (!this._preRender(renderer)) {
				return;
			}

			if (this.group.useRenderTexture) {
				this._pushTexture(renderer);
			}

			this.containerRenderWebGL(renderer);
			this._postRender(renderer);

			if (this.group.useRenderTexture) {
				this._popTexture(renderer);
			}
		}

		renderCanvas(renderer: PIXI.CanvasRenderer) {
			if (this._preRender(renderer)) {
				this.containerRenderCanvas(renderer);
				this._postRender(renderer);
			}
		}

		destroy(options?: any) {
			if (this._thisRenderTexture) {
				this._thisRenderTexture.destroy(true);
			}
			super.destroy(options);
		}
	}
}
