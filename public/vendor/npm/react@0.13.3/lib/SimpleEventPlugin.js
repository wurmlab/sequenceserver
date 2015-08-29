/* */ 
(function(process) {
  'use strict';
  var EventConstants = require("./EventConstants");
  var EventPluginUtils = require("./EventPluginUtils");
  var EventPropagators = require("./EventPropagators");
  var SyntheticClipboardEvent = require("./SyntheticClipboardEvent");
  var SyntheticEvent = require("./SyntheticEvent");
  var SyntheticFocusEvent = require("./SyntheticFocusEvent");
  var SyntheticKeyboardEvent = require("./SyntheticKeyboardEvent");
  var SyntheticMouseEvent = require("./SyntheticMouseEvent");
  var SyntheticDragEvent = require("./SyntheticDragEvent");
  var SyntheticTouchEvent = require("./SyntheticTouchEvent");
  var SyntheticUIEvent = require("./SyntheticUIEvent");
  var SyntheticWheelEvent = require("./SyntheticWheelEvent");
  var getEventCharCode = require("./getEventCharCode");
  var invariant = require("./invariant");
  var keyOf = require("./keyOf");
  var warning = require("./warning");
  var topLevelTypes = EventConstants.topLevelTypes;
  var eventTypes = {
    blur: {phasedRegistrationNames: {
        bubbled: keyOf({onBlur: true}),
        captured: keyOf({onBlurCapture: true})
      }},
    click: {phasedRegistrationNames: {
        bubbled: keyOf({onClick: true}),
        captured: keyOf({onClickCapture: true})
      }},
    contextMenu: {phasedRegistrationNames: {
        bubbled: keyOf({onContextMenu: true}),
        captured: keyOf({onContextMenuCapture: true})
      }},
    copy: {phasedRegistrationNames: {
        bubbled: keyOf({onCopy: true}),
        captured: keyOf({onCopyCapture: true})
      }},
    cut: {phasedRegistrationNames: {
        bubbled: keyOf({onCut: true}),
        captured: keyOf({onCutCapture: true})
      }},
    doubleClick: {phasedRegistrationNames: {
        bubbled: keyOf({onDoubleClick: true}),
        captured: keyOf({onDoubleClickCapture: true})
      }},
    drag: {phasedRegistrationNames: {
        bubbled: keyOf({onDrag: true}),
        captured: keyOf({onDragCapture: true})
      }},
    dragEnd: {phasedRegistrationNames: {
        bubbled: keyOf({onDragEnd: true}),
        captured: keyOf({onDragEndCapture: true})
      }},
    dragEnter: {phasedRegistrationNames: {
        bubbled: keyOf({onDragEnter: true}),
        captured: keyOf({onDragEnterCapture: true})
      }},
    dragExit: {phasedRegistrationNames: {
        bubbled: keyOf({onDragExit: true}),
        captured: keyOf({onDragExitCapture: true})
      }},
    dragLeave: {phasedRegistrationNames: {
        bubbled: keyOf({onDragLeave: true}),
        captured: keyOf({onDragLeaveCapture: true})
      }},
    dragOver: {phasedRegistrationNames: {
        bubbled: keyOf({onDragOver: true}),
        captured: keyOf({onDragOverCapture: true})
      }},
    dragStart: {phasedRegistrationNames: {
        bubbled: keyOf({onDragStart: true}),
        captured: keyOf({onDragStartCapture: true})
      }},
    drop: {phasedRegistrationNames: {
        bubbled: keyOf({onDrop: true}),
        captured: keyOf({onDropCapture: true})
      }},
    focus: {phasedRegistrationNames: {
        bubbled: keyOf({onFocus: true}),
        captured: keyOf({onFocusCapture: true})
      }},
    input: {phasedRegistrationNames: {
        bubbled: keyOf({onInput: true}),
        captured: keyOf({onInputCapture: true})
      }},
    keyDown: {phasedRegistrationNames: {
        bubbled: keyOf({onKeyDown: true}),
        captured: keyOf({onKeyDownCapture: true})
      }},
    keyPress: {phasedRegistrationNames: {
        bubbled: keyOf({onKeyPress: true}),
        captured: keyOf({onKeyPressCapture: true})
      }},
    keyUp: {phasedRegistrationNames: {
        bubbled: keyOf({onKeyUp: true}),
        captured: keyOf({onKeyUpCapture: true})
      }},
    load: {phasedRegistrationNames: {
        bubbled: keyOf({onLoad: true}),
        captured: keyOf({onLoadCapture: true})
      }},
    error: {phasedRegistrationNames: {
        bubbled: keyOf({onError: true}),
        captured: keyOf({onErrorCapture: true})
      }},
    mouseDown: {phasedRegistrationNames: {
        bubbled: keyOf({onMouseDown: true}),
        captured: keyOf({onMouseDownCapture: true})
      }},
    mouseMove: {phasedRegistrationNames: {
        bubbled: keyOf({onMouseMove: true}),
        captured: keyOf({onMouseMoveCapture: true})
      }},
    mouseOut: {phasedRegistrationNames: {
        bubbled: keyOf({onMouseOut: true}),
        captured: keyOf({onMouseOutCapture: true})
      }},
    mouseOver: {phasedRegistrationNames: {
        bubbled: keyOf({onMouseOver: true}),
        captured: keyOf({onMouseOverCapture: true})
      }},
    mouseUp: {phasedRegistrationNames: {
        bubbled: keyOf({onMouseUp: true}),
        captured: keyOf({onMouseUpCapture: true})
      }},
    paste: {phasedRegistrationNames: {
        bubbled: keyOf({onPaste: true}),
        captured: keyOf({onPasteCapture: true})
      }},
    reset: {phasedRegistrationNames: {
        bubbled: keyOf({onReset: true}),
        captured: keyOf({onResetCapture: true})
      }},
    scroll: {phasedRegistrationNames: {
        bubbled: keyOf({onScroll: true}),
        captured: keyOf({onScrollCapture: true})
      }},
    submit: {phasedRegistrationNames: {
        bubbled: keyOf({onSubmit: true}),
        captured: keyOf({onSubmitCapture: true})
      }},
    touchCancel: {phasedRegistrationNames: {
        bubbled: keyOf({onTouchCancel: true}),
        captured: keyOf({onTouchCancelCapture: true})
      }},
    touchEnd: {phasedRegistrationNames: {
        bubbled: keyOf({onTouchEnd: true}),
        captured: keyOf({onTouchEndCapture: true})
      }},
    touchMove: {phasedRegistrationNames: {
        bubbled: keyOf({onTouchMove: true}),
        captured: keyOf({onTouchMoveCapture: true})
      }},
    touchStart: {phasedRegistrationNames: {
        bubbled: keyOf({onTouchStart: true}),
        captured: keyOf({onTouchStartCapture: true})
      }},
    wheel: {phasedRegistrationNames: {
        bubbled: keyOf({onWheel: true}),
        captured: keyOf({onWheelCapture: true})
      }}
  };
  var topLevelEventsToDispatchConfig = {
    topBlur: eventTypes.blur,
    topClick: eventTypes.click,
    topContextMenu: eventTypes.contextMenu,
    topCopy: eventTypes.copy,
    topCut: eventTypes.cut,
    topDoubleClick: eventTypes.doubleClick,
    topDrag: eventTypes.drag,
    topDragEnd: eventTypes.dragEnd,
    topDragEnter: eventTypes.dragEnter,
    topDragExit: eventTypes.dragExit,
    topDragLeave: eventTypes.dragLeave,
    topDragOver: eventTypes.dragOver,
    topDragStart: eventTypes.dragStart,
    topDrop: eventTypes.drop,
    topError: eventTypes.error,
    topFocus: eventTypes.focus,
    topInput: eventTypes.input,
    topKeyDown: eventTypes.keyDown,
    topKeyPress: eventTypes.keyPress,
    topKeyUp: eventTypes.keyUp,
    topLoad: eventTypes.load,
    topMouseDown: eventTypes.mouseDown,
    topMouseMove: eventTypes.mouseMove,
    topMouseOut: eventTypes.mouseOut,
    topMouseOver: eventTypes.mouseOver,
    topMouseUp: eventTypes.mouseUp,
    topPaste: eventTypes.paste,
    topReset: eventTypes.reset,
    topScroll: eventTypes.scroll,
    topSubmit: eventTypes.submit,
    topTouchCancel: eventTypes.touchCancel,
    topTouchEnd: eventTypes.touchEnd,
    topTouchMove: eventTypes.touchMove,
    topTouchStart: eventTypes.touchStart,
    topWheel: eventTypes.wheel
  };
  for (var type in topLevelEventsToDispatchConfig) {
    topLevelEventsToDispatchConfig[type].dependencies = [type];
  }
  var SimpleEventPlugin = {
    eventTypes: eventTypes,
    executeDispatch: function(event, listener, domID) {
      var returnValue = EventPluginUtils.executeDispatch(event, listener, domID);
      ("production" !== process.env.NODE_ENV ? warning(typeof returnValue !== 'boolean', 'Returning `false` from an event handler is deprecated and will be ' + 'ignored in a future release. Instead, manually call ' + 'e.stopPropagation() or e.preventDefault(), as appropriate.') : null);
      if (returnValue === false) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    extractEvents: function(topLevelType, topLevelTarget, topLevelTargetID, nativeEvent) {
      var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
      if (!dispatchConfig) {
        return null;
      }
      var EventConstructor;
      switch (topLevelType) {
        case topLevelTypes.topInput:
        case topLevelTypes.topLoad:
        case topLevelTypes.topError:
        case topLevelTypes.topReset:
        case topLevelTypes.topSubmit:
          EventConstructor = SyntheticEvent;
          break;
        case topLevelTypes.topKeyPress:
          if (getEventCharCode(nativeEvent) === 0) {
            return null;
          }
        case topLevelTypes.topKeyDown:
        case topLevelTypes.topKeyUp:
          EventConstructor = SyntheticKeyboardEvent;
          break;
        case topLevelTypes.topBlur:
        case topLevelTypes.topFocus:
          EventConstructor = SyntheticFocusEvent;
          break;
        case topLevelTypes.topClick:
          if (nativeEvent.button === 2) {
            return null;
          }
        case topLevelTypes.topContextMenu:
        case topLevelTypes.topDoubleClick:
        case topLevelTypes.topMouseDown:
        case topLevelTypes.topMouseMove:
        case topLevelTypes.topMouseOut:
        case topLevelTypes.topMouseOver:
        case topLevelTypes.topMouseUp:
          EventConstructor = SyntheticMouseEvent;
          break;
        case topLevelTypes.topDrag:
        case topLevelTypes.topDragEnd:
        case topLevelTypes.topDragEnter:
        case topLevelTypes.topDragExit:
        case topLevelTypes.topDragLeave:
        case topLevelTypes.topDragOver:
        case topLevelTypes.topDragStart:
        case topLevelTypes.topDrop:
          EventConstructor = SyntheticDragEvent;
          break;
        case topLevelTypes.topTouchCancel:
        case topLevelTypes.topTouchEnd:
        case topLevelTypes.topTouchMove:
        case topLevelTypes.topTouchStart:
          EventConstructor = SyntheticTouchEvent;
          break;
        case topLevelTypes.topScroll:
          EventConstructor = SyntheticUIEvent;
          break;
        case topLevelTypes.topWheel:
          EventConstructor = SyntheticWheelEvent;
          break;
        case topLevelTypes.topCopy:
        case topLevelTypes.topCut:
        case topLevelTypes.topPaste:
          EventConstructor = SyntheticClipboardEvent;
          break;
      }
      ("production" !== process.env.NODE_ENV ? invariant(EventConstructor, 'SimpleEventPlugin: Unhandled event type, `%s`.', topLevelType) : invariant(EventConstructor));
      var event = EventConstructor.getPooled(dispatchConfig, topLevelTargetID, nativeEvent);
      EventPropagators.accumulateTwoPhaseDispatches(event);
      return event;
    }
  };
  module.exports = SimpleEventPlugin;
})(require("process"));
