/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV !== "production") {
    (function() {
      'use strict';
      var ImmediatePriority = 1;
      var UserBlockingPriority = 2;
      var NormalPriority = 3;
      var LowPriority = 4;
      var IdlePriority = 5;
      var perf = window.performance;
      var setTimeout = window.setTimeout;
      var scheduler = global.scheduler;
      var getCurrentTime = perf.now.bind(perf);
      var unstable_now = getCurrentTime;
      var yieldInterval = 5;
      var deadline = 0;
      var currentPriorityLevel_DEPRECATED = NormalPriority;
      function unstable_shouldYield() {
        return getCurrentTime() >= deadline;
      }
      function unstable_requestPaint() {}
      function unstable_scheduleCallback(priorityLevel, callback, options) {
        var postTaskPriority;
        switch (priorityLevel) {
          case ImmediatePriority:
          case UserBlockingPriority:
            postTaskPriority = 'user-blocking';
            break;
          case LowPriority:
          case NormalPriority:
            postTaskPriority = 'user-visible';
            break;
          case IdlePriority:
            postTaskPriority = 'background';
            break;
          default:
            postTaskPriority = 'user-visible';
            break;
        }
        var controller = new TaskController();
        var postTaskOptions = {
          priority: postTaskPriority,
          delay: typeof options === 'object' && options !== null ? options.delay : 0,
          signal: controller.signal
        };
        var node = {_controller: controller};
        scheduler.postTask(runTask.bind(null, priorityLevel, postTaskPriority, node, callback), postTaskOptions).catch(handleAbortError);
        return node;
      }
      function runTask(priorityLevel, postTaskPriority, node, callback) {
        deadline = getCurrentTime() + yieldInterval;
        try {
          currentPriorityLevel_DEPRECATED = priorityLevel;
          var _didTimeout_DEPRECATED = false;
          var result = callback(_didTimeout_DEPRECATED);
          if (typeof result === 'function') {
            var continuation = result;
            var continuationController = new TaskController();
            var continuationOptions = {
              priority: postTaskPriority,
              signal: continuationController.signal
            };
            node._controller = continuationController;
            scheduler.postTask(runTask.bind(null, priorityLevel, postTaskPriority, node, continuation), continuationOptions).catch(handleAbortError);
          }
        } catch (error) {
          setTimeout(function() {
            throw error;
          });
        } finally {
          currentPriorityLevel_DEPRECATED = NormalPriority;
        }
      }
      function handleAbortError(error) {}
      function unstable_cancelCallback(node) {
        var controller = node._controller;
        controller.abort();
      }
      function unstable_runWithPriority(priorityLevel, callback) {
        var previousPriorityLevel = currentPriorityLevel_DEPRECATED;
        currentPriorityLevel_DEPRECATED = priorityLevel;
        try {
          return callback();
        } finally {
          currentPriorityLevel_DEPRECATED = previousPriorityLevel;
        }
      }
      function unstable_getCurrentPriorityLevel() {
        return currentPriorityLevel_DEPRECATED;
      }
      function unstable_next(callback) {
        var priorityLevel;
        switch (currentPriorityLevel_DEPRECATED) {
          case ImmediatePriority:
          case UserBlockingPriority:
          case NormalPriority:
            priorityLevel = NormalPriority;
            break;
          default:
            priorityLevel = currentPriorityLevel_DEPRECATED;
            break;
        }
        var previousPriorityLevel = currentPriorityLevel_DEPRECATED;
        currentPriorityLevel_DEPRECATED = priorityLevel;
        try {
          return callback();
        } finally {
          currentPriorityLevel_DEPRECATED = previousPriorityLevel;
        }
      }
      function unstable_wrapCallback(callback) {
        var parentPriorityLevel = currentPriorityLevel_DEPRECATED;
        return function() {
          var previousPriorityLevel = currentPriorityLevel_DEPRECATED;
          currentPriorityLevel_DEPRECATED = parentPriorityLevel;
          try {
            return callback();
          } finally {
            currentPriorityLevel_DEPRECATED = previousPriorityLevel;
          }
        };
      }
      function unstable_forceFrameRate() {}
      function unstable_pauseExecution() {}
      function unstable_continueExecution() {}
      function unstable_getFirstCallbackNode() {
        return null;
      }
      var unstable_Profiling = null;
      exports.unstable_IdlePriority = IdlePriority;
      exports.unstable_ImmediatePriority = ImmediatePriority;
      exports.unstable_LowPriority = LowPriority;
      exports.unstable_NormalPriority = NormalPriority;
      exports.unstable_Profiling = unstable_Profiling;
      exports.unstable_UserBlockingPriority = UserBlockingPriority;
      exports.unstable_cancelCallback = unstable_cancelCallback;
      exports.unstable_continueExecution = unstable_continueExecution;
      exports.unstable_forceFrameRate = unstable_forceFrameRate;
      exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
      exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
      exports.unstable_next = unstable_next;
      exports.unstable_now = unstable_now;
      exports.unstable_pauseExecution = unstable_pauseExecution;
      exports.unstable_requestPaint = unstable_requestPaint;
      exports.unstable_runWithPriority = unstable_runWithPriority;
      exports.unstable_scheduleCallback = unstable_scheduleCallback;
      exports.unstable_shouldYield = unstable_shouldYield;
      exports.unstable_wrapCallback = unstable_wrapCallback;
    })();
  }
})(require('process'));
