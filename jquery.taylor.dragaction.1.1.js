(function(window, document, $, undefined) {

  'use strict';

  function isFunction (func) { // TODO possible use _.isFunction
    return typeof func === 'function';
  }

  function onTouchStart ($transitionElems, $moveElems, movingClass, moveStartCallback) {

    return function () {

      $transitionElems.addClass(movingClass);

      if (moveStartCallback) moveStartCallback.call(this);

      return $moveElems.position().left;

    };

  }

  function onTouchMove ($moveElems, dragBoundary, navWidth, movingCallback) {

    return function (pageX, startPageX, elemPositionLeft) {
      var moveX = elemPositionLeft + pageX - startPageX; // spec.moveX is a property of the settings instance for easy access TODO - FIX TO MAKE MORE FLUID FROM BOTH SIDES

      // defines if we allow the user to drag the element beyond the bounds of the virtal container
      if (dragBoundary) {
        if (moveX < 0) moveX = 0; // dont allow move past left side of screen
        if (moveX > navWidth) moveX = navWidth; // and right side
      }
      $moveElems.css('transform', 'translateX(' + moveX + 'px)');

      if (movingCallback) movingCallback.call(this, moveX / navWidth, moveX - elemPositionLeft);

    };
  }

  function onTouchEnd ($transitionElems, movingClass, movingStyles, containerWidth, dragSpeedThreshold, releaseCallback) {

    return function (pageX, startPageX, startTime, endTime) {

      var dragSpeed = Math.abs((pageX - startPageX) / (endTime - startTime));

      // remove the moving style properties
      if (movingStyles && movingStyles.length) {
        for (var i = 0; i < movingStyles.length; i++) {
          $transitionElems.css(movingStyles[i], ''); // remove the style property
        }
      }

      $transitionElems.removeClass(movingClass); // remove style set by dragging

      if (releaseCallback) releaseCallback.call(this, pageX / containerWidth, pageX - startPageX, dragSpeed * 100 > dragSpeedThreshold, dragSpeed); // TODO defined a reference to the releaseDrag callback after checking if is function

    };
  }

  $.fn.dragAction = function (spec) {

    var defaults = $.fn.dragAction.defaults;

    var moveStartCallback = isFunction(spec.moveStart) ? spec.moveStart : false,
        movingCallback = isFunction(spec.moving) ? spec.moving : false,
        releaseDragCallback = isFunction(spec.releaseDrag) ? spec.releaseDrag : false,
        initCallback = isFunction(spec.init) ? spec.init : false,
        allowCancelScroll = spec.allowCancelScroll || defaults.allowCancelScroll,
        cancelScrollTime = spec.cancelScrollTime || defaults.cancelScrollTime, // arbitrary
        cancelScrollThresholdRatio = spec.cancelScrollThresholdRatio || defaults.cancelScrollThresholdRatio, // arbitrary
        dragSpeedThreshold = spec.dragSpeedThreshold || defaults.dragSpeedThreshold,
        movingClass = spec.movingClass || defaults.movingClass;

    // store the instances for the spec to be able to reference all instances from single instance
    spec.instances = [];

    this.each(function () {

      var instance = Object.create(spec),
          $this = $(this);

      var $transitionElems = spec.transitionElems || spec.moveElems || $this,
          $moveElems = spec.moveElems || $this;

      // curry these functions
      var touchStart = onTouchStart($transitionElems, $moveElems, spec.movingClass, moveStartCallback),
          touchMove = onTouchMove($moveElems, spec.dragBoundary, spec.containerWidth, movingCallback),
          touchEnd = onTouchEnd($transitionElems, movingClass, spec.movingStyles, spec.containerWidth, dragSpeedThreshold, releaseDragCallback);

      // attach references to the instance for the purposes of allowing advice (AOP, ex: proxies) to be added to these functions from the instance
      touchStart = instance.touchStart = touchStart.bind(instance);
      touchMove = instance.touchMove = touchMove.bind(instance);
      touchEnd = instance.touchEnd = touchEnd.bind(instance);

      instance.elem = $this;

      if (initCallback) initCallback.call(instance);

      var touchStartEventCallback = function (e) {

        touchStart.touch = event.touches[0];
        touchStart.startPageX = touchStart.touch.pageX;
        touchStart.startPageY = touchStart.touch.pageY;
        touchStart.startTime = new Date().getTime();
        touchStart.elemPosLeft = touchStart();

      }

      var touchMoveEventCallback = function (e) {
        e.preventDefault();
        e.stopPropagation();

        touchMove(touchStart.touch.pageX, touchStart.startPageX, touchStart.elemPosLeft);
      }

      var touchEndEventCallback = function (e) {
        touchEnd(touchStart.touch.pageX, touchStart.startPageX, touchStart.startTime, new Date().getTime());
      }

      if(allowCancelScroll) {

        // if we are allowing cancel scrolling, then we have to bind the touchmove and touchend events after touchstart
        // only if the users intent (determined by some threshold logic "advice" that we are giving to the touchStartEventCallback function)
        // if the users intent is to scroll, and we don't bind the events, then the touch event will NOT prevent the scroll event from propagating to the window
        // why do we do this? because you cannot bind the touchmove event to an element because it will prevent the scroll event from propagating to the window
        // (it might still propagate, but the touchmove event prevents any movement)

        var touchStartEventCallbackProxy = touchStartEventCallback,
            touchEndEventCallbackProxy = touchEndEventCallback,
            touchInterval;

        touchEndEventCallback = function () {

          touchEndEventCallbackProxy.apply(this, arguments); // do original
          clearTimeout(touchInterval);
          $this.off('touchmove touchend');

        }

        touchStartEventCallback = function () {

          touchStartEventCallbackProxy.apply(this, arguments); // do original

          touchInterval = setTimeout(function () {

            if(Math.abs(touchStart.startPageY - touchStart.touch.pageY) > cancelScrollTime * cancelScrollThresholdRatio) return;

            bindTouchMoveEnd();

          }, cancelScrollTime);
        }

      } else {
        bindTouchMoveEnd();
      }

      $this.on('touchstart', touchStartEventCallback);
      
      function bindTouchMoveEnd () {
        $this.on('touchmove', touchMoveEventCallback).on('touchend', touchEndEventCallback);
      }

      $this.data('dragAction', instance); // attach this plugin instance to the element
      spec.instances.push(instance); // push each instance of the slider onto the prototype

    });

    return spec.instances; // access to instance

  };

  $.fn.dragAction.defaults = {
    cancelScrollTime: 15,
    cancelScrollThresholdRatio: .15,
    dragSpeedThreshold: 20,
    movingClass: 'moving',
    allowCancelScroll: true
  };


})(window, document, jQuery);