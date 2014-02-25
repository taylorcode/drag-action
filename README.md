#dragAction

---

## About

**dragAction** is a jQuery plugin that provides the basic framework for creating gestures comparable in performance and smoothness to native gestures.

## Demos
1. To come.
2. To come.

### Required Properties

- **containerWidth** `{Integer}`: The width of the element that contains your drag elements.

### Optional Properties

- **moveElems** `{$Object}, default: The $node that the plugin acts on.`: The element(s) that will move when the user touches/drags.
- **transitionElems** `{$Object}, default: moveElems`: The elements that will receive the `movingClass` while the drag is occuring.
- **movingClass** `{String}, default: 'moving'`: The class that the `transitionElems` will receive while the drag is occuring.
- **dragBoundary** `{Boolean}, default: true`: Constrain movement of the `moveElems` to the boundary of the `containerWidth`
- **movingStyles** `{Array}`: Styles that will be removed from the `transitionElems` once the user releases the drag.
- **allowCancelScroll** `{Boolean}, default: true`: Allow the user to scroll vertically by dragging upward or downward on the `moveElems`

### Optional Subjective Properties

- **dragSpeedThreshold** `{Number}, default: 20`: The threshold that defines the speed the user must drag the `moveElems`, when broken indicates that the user dragged the elements fast enough to indicate some action.

### Optional Subjective Properties iff allowCancelScroll is true

- **cancelScrollTime** `{Number}, default: 15`: The duration of time in MS after the user has started to drag before the plugin determines if the user is attempting to vertically scroll or horizontally drag.
- **cancelScrollThresholdRatio** `{Number}, default: .15`: The factor that is multiplied be the `cancelScrollTime` to determine a threshold that when broken indicates that the user is intending to scroll vertically and not drag horizontally.


#### Methods

- **initCallback** `function() {`: Immediately fired on initialization of the plugin on each of the $Object's the plugin is created on.
- **moveStartCallback** `function() {`: Fired as soon as the drag begins.
- **movingCallback** `function( completeRatio, distXFromOrigin ) {`: Invoked every time the touchmove is fired while the user is dragging with the ratio of the total drag distance the user has dragged (`completeRatio`) determined by the `containerWidth` and the distance the user has dragged (`distXFromOrigin`) from the x origin of the `moveElems`.
- **releaseDragCallback** `function( completeRatio, distanceXMoved, brokeDragThreshold ) {`: Invoked once the user has lifted drag from the screen, invoked with the same arguments as `movingCallback`, in addition to (`brokeDragThreshold`) that indicates if the drag speed was sufficient to surpass the `dragSpeedThreshold`.