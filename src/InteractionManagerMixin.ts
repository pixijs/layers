//TODO: add maxDisplayOrder for displayObjects and use it to speed up the interaction here

/**
 * @mixin
 */

namespace pixi_display {
    import DisplayObject = PIXI.DisplayObject;
    import Point = PIXI.Point;
    import InteractionEvent = PIXI.interaction.InteractionEvent;

    export function processInteractive51(strangeStuff: InteractionEvent | Point, displayObject: DisplayObject, func: Function, hitTest: boolean, interactive: boolean) {
        if (!this.search) {
            this.search = new LayersTreeSearch();
        }
        this.search.findHit(strangeStuff, displayObject, func, hitTest);

        const delayedEvents = this.delayedEvents;

        if (delayedEvents && delayedEvents.length) {
            // Reset the propagation hint, because we start deeper in the tree again.
            (strangeStuff as any).stopPropagationHint = false;

            const delayedLen = delayedEvents.length;

            this.delayedEvents = [];

            for (let i = 0; i < delayedLen; i++) {
                const {displayObject, eventString, eventData} = delayedEvents[i];

                // When we reach the object we wanted to stop propagating at,
                // set the propagation hint.
                if (eventData.stopsPropagatingAt === displayObject) {
                    eventData.stopPropagationHint = true;
                }

                this.dispatchEvent(displayObject, eventString, eventData);
            }
        }
    }

    export function patchInteractionManager(interactionManager: any) {
        if (!interactionManager) {
            return;
        }
        if (interactionManager.search) {
            if (!interactionManager.search.worksWithDisplay) {
                interactionManager.search = new LayersTreeSearch();
            }
        } else {
            interactionManager.processInteractive = processInteractive51;
        }
    }
}
