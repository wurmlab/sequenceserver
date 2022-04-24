/* */ 
(function(process) {
  'use strict';
  if (process.env.NODE_ENV !== "production") {
    (function() {
      'use strict';
      var enableSchedulerDebugging = false;
      var enableProfiling = false;
      function push(heap, node) {
        var index = heap.length;
        heap.push(node);
        siftUp(heap, node, index);
      }
      function peek(heap) {
        return heap.length === 0 ? null : heap[0];
      }
      function pop(heap) {
        if (heap.length === 0) {
          return null;
        }
        var first = heap[0];
        var last = heap.pop();
        if (last !== first) {
          heap[0] = last;
          siftDown(heap, last, 0);
        }
        return first;
      }
      function siftUp(heap, node, i) {
        var index = i;
        while (index > 0) {
          var parentIndex = index - 1 >>> 1;
          var parent = heap[parentIndex];
          if (compare(parent, node) > 0) {
            heap[parentIndex] = node;
            heap[index] = parent;
            index = parentIndex;
          } else {
            return;
          }
        }
      }
      function siftDown(heap, node, i) {
        var index = i;
        var length = heap.length;
        var halfLength = length >>> 1;
        while (index < halfLength) {
          var leftIndex = (index + 1) * 2 - 1;
          var left = heap[leftIndex];
          var rightIndex = leftIndex + 1;
          var right = heap[rightIndex];
          if (compare(left, node) < 0) {
            if (rightIndex < length && compare(right, left) < 0) {
              heap[index] = right;
              heap[rightIndex] = node;
              index = rightIndex;
            } else {
              heap[index] = left;
              heap[leftIndex] = node;
              index = leftIndex;
            }
          } else if (rightIndex < length && compare(right, node) < 0) {
            heap[index] = right;
            heap[rightIndex] = node;
            index = rightIndex;
          } else {
            return;
          }
        }
      }
      function compare(a, b) {
        var diff = a.sortIndex - b.sortIndex;
        return diff !== 0 ? diff : a.id - b.id;
      }
      var ImmediatePriority = 1;
      var UserBlockingPriority = 2;
      var NormalPriority = 3;
      var LowPriority = 4;
      var IdlePriority = 5;
      function markTaskErrored(task, ms) {}
      var maxSigned31BitInt = 1073741823;
      var IMMEDIATE_PRIORITY_TIMEOUT = -1;
      var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
      var NORMAL_PRIORITY_TIMEOUT = 5000;
      var LOW_PRIORITY_TIMEOUT = 10000;
      var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;
      var taskQueue = [];
      var timerQueue = [];
      var taskIdCounter = 1;
      var currentTask = null;
      var currentPriorityLevel = NormalPriority;
      var isPerformingWork = false;
      var isHostCallbackScheduled = false;
      var isHostTimeoutScheduled = false;
      var currentMockTime = 0;
      var scheduledCallback = null;
      var scheduledTimeout = null;
      var timeoutTime = -1;
      var yieldedValues = null;
      var expectedNumberOfYields = -1;
      var didStop = false;
      var isFlushing = false;
      var needsPaint = false;
      var shouldYieldForPaint = false;
      var disableYieldValue = false;
      function setDisableYieldValue(newValue) {
        disableYieldValue = newValue;
      }
      function advanceTimers(currentTime) {
        var timer = peek(timerQueue);
        while (timer !== null) {
          if (timer.callback === null) {
            pop(timerQueue);
          } else if (timer.startTime <= currentTime) {
            pop(timerQueue);
            timer.sortIndex = timer.expirationTime;
            push(taskQueue, timer);
          } else {
            return;
          }
          timer = peek(timerQueue);
        }
      }
      function handleTimeout(currentTime) {
        isHostTimeoutScheduled = false;
        advanceTimers(currentTime);
        if (!isHostCallbackScheduled) {
          if (peek(taskQueue) !== null) {
            isHostCallbackScheduled = true;
            requestHostCallback(flushWork);
          } else {
            var firstTimer = peek(timerQueue);
            if (firstTimer !== null) {
              requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
            }
          }
        }
      }
      function flushWork(hasTimeRemaining, initialTime) {
        isHostCallbackScheduled = false;
        if (isHostTimeoutScheduled) {
          isHostTimeoutScheduled = false;
          cancelHostTimeout();
        }
        isPerformingWork = true;
        var previousPriorityLevel = currentPriorityLevel;
        try {
          if (enableProfiling) {
            try {
              return workLoop(hasTimeRemaining, initialTime);
            } catch (error) {
              if (currentTask !== null) {
                var currentTime = getCurrentTime();
                markTaskErrored(currentTask, currentTime);
                currentTask.isQueued = false;
              }
              throw error;
            }
          } else {
            return workLoop(hasTimeRemaining, initialTime);
          }
        } finally {
          currentTask = null;
          currentPriorityLevel = previousPriorityLevel;
          isPerformingWork = false;
        }
      }
      function workLoop(hasTimeRemaining, initialTime) {
        var currentTime = initialTime;
        advanceTimers(currentTime);
        currentTask = peek(taskQueue);
        while (currentTask !== null && !(enableSchedulerDebugging)) {
          if (currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())) {
            break;
          }
          var callback = currentTask.callback;
          if (typeof callback === 'function') {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            var didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            var continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrentTime();
            if (typeof continuationCallback === 'function') {
              currentTask.callback = continuationCallback;
            } else {
              if (currentTask === peek(taskQueue)) {
                pop(taskQueue);
              }
            }
            advanceTimers(currentTime);
          } else {
            pop(taskQueue);
          }
          currentTask = peek(taskQueue);
        }
        if (currentTask !== null) {
          return true;
        } else {
          var firstTimer = peek(timerQueue);
          if (firstTimer !== null) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
          }
          return false;
        }
      }
      function unstable_runWithPriority(priorityLevel, eventHandler) {
        switch (priorityLevel) {
          case ImmediatePriority:
          case UserBlockingPriority:
          case NormalPriority:
          case LowPriority:
          case IdlePriority:
            break;
          default:
            priorityLevel = NormalPriority;
        }
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;
        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      }
      function unstable_next(eventHandler) {
        var priorityLevel;
        switch (currentPriorityLevel) {
          case ImmediatePriority:
          case UserBlockingPriority:
          case NormalPriority:
            priorityLevel = NormalPriority;
            break;
          default:
            priorityLevel = currentPriorityLevel;
            break;
        }
        var previousPriorityLevel = currentPriorityLevel;
        currentPriorityLevel = priorityLevel;
        try {
          return eventHandler();
        } finally {
          currentPriorityLevel = previousPriorityLevel;
        }
      }
      function unstable_wrapCallback(callback) {
        var parentPriorityLevel = currentPriorityLevel;
        return function() {
          var previousPriorityLevel = currentPriorityLevel;
          currentPriorityLevel = parentPriorityLevel;
          try {
            return callback.apply(this, arguments);
          } finally {
            currentPriorityLevel = previousPriorityLevel;
          }
        };
      }
      function unstable_scheduleCallback(priorityLevel, callback, options) {
        var currentTime = getCurrentTime();
        var startTime;
        if (typeof options === 'object' && options !== null) {
          var delay = options.delay;
          if (typeof delay === 'number' && delay > 0) {
            startTime = currentTime + delay;
          } else {
            startTime = currentTime;
          }
        } else {
          startTime = currentTime;
        }
        var timeout;
        switch (priorityLevel) {
          case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT;
            break;
          case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
            break;
          case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT;
            break;
          case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT;
            break;
          case NormalPriority:
          default:
            timeout = NORMAL_PRIORITY_TIMEOUT;
            break;
        }
        var expirationTime = startTime + timeout;
        var newTask = {
          id: taskIdCounter++,
          callback: callback,
          priorityLevel: priorityLevel,
          startTime: startTime,
          expirationTime: expirationTime,
          sortIndex: -1
        };
        if (startTime > currentTime) {
          newTask.sortIndex = startTime;
          push(timerQueue, newTask);
          if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
            if (isHostTimeoutScheduled) {
              cancelHostTimeout();
            } else {
              isHostTimeoutScheduled = true;
            }
            requestHostTimeout(handleTimeout, startTime - currentTime);
          }
        } else {
          newTask.sortIndex = expirationTime;
          push(taskQueue, newTask);
          if (!isHostCallbackScheduled && !isPerformingWork) {
            isHostCallbackScheduled = true;
            requestHostCallback(flushWork);
          }
        }
        return newTask;
      }
      function unstable_pauseExecution() {}
      function unstable_continueExecution() {
        if (!isHostCallbackScheduled && !isPerformingWork) {
          isHostCallbackScheduled = true;
          requestHostCallback(flushWork);
        }
      }
      function unstable_getFirstCallbackNode() {
        return peek(taskQueue);
      }
      function unstable_cancelCallback(task) {
        task.callback = null;
      }
      function unstable_getCurrentPriorityLevel() {
        return currentPriorityLevel;
      }
      function requestHostCallback(callback) {
        scheduledCallback = callback;
      }
      function requestHostTimeout(callback, ms) {
        scheduledTimeout = callback;
        timeoutTime = currentMockTime + ms;
      }
      function cancelHostTimeout() {
        scheduledTimeout = null;
        timeoutTime = -1;
      }
      function shouldYieldToHost() {
        if (expectedNumberOfYields === 0 && yieldedValues === null || expectedNumberOfYields !== -1 && yieldedValues !== null && yieldedValues.length >= expectedNumberOfYields || shouldYieldForPaint && needsPaint) {
          didStop = true;
          return true;
        }
        return false;
      }
      function getCurrentTime() {
        return currentMockTime;
      }
      function forceFrameRate() {}
      function reset() {
        if (isFlushing) {
          throw new Error('Cannot reset while already flushing work.');
        }
        currentMockTime = 0;
        scheduledCallback = null;
        scheduledTimeout = null;
        timeoutTime = -1;
        yieldedValues = null;
        expectedNumberOfYields = -1;
        didStop = false;
        isFlushing = false;
        needsPaint = false;
      }
      function unstable_flushNumberOfYields(count) {
        if (isFlushing) {
          throw new Error('Already flushing work.');
        }
        if (scheduledCallback !== null) {
          var cb = scheduledCallback;
          expectedNumberOfYields = count;
          isFlushing = true;
          try {
            var hasMoreWork = true;
            do {
              hasMoreWork = cb(true, currentMockTime);
            } while (hasMoreWork && !didStop);
            if (!hasMoreWork) {
              scheduledCallback = null;
            }
          } finally {
            expectedNumberOfYields = -1;
            didStop = false;
            isFlushing = false;
          }
        }
      }
      function unstable_flushUntilNextPaint() {
        if (isFlushing) {
          throw new Error('Already flushing work.');
        }
        if (scheduledCallback !== null) {
          var cb = scheduledCallback;
          shouldYieldForPaint = true;
          needsPaint = false;
          isFlushing = true;
          try {
            var hasMoreWork = true;
            do {
              hasMoreWork = cb(true, currentMockTime);
            } while (hasMoreWork && !didStop);
            if (!hasMoreWork) {
              scheduledCallback = null;
            }
          } finally {
            shouldYieldForPaint = false;
            didStop = false;
            isFlushing = false;
          }
        }
      }
      function unstable_flushExpired() {
        if (isFlushing) {
          throw new Error('Already flushing work.');
        }
        if (scheduledCallback !== null) {
          isFlushing = true;
          try {
            var hasMoreWork = scheduledCallback(false, currentMockTime);
            if (!hasMoreWork) {
              scheduledCallback = null;
            }
          } finally {
            isFlushing = false;
          }
        }
      }
      function unstable_flushAllWithoutAsserting() {
        if (isFlushing) {
          throw new Error('Already flushing work.');
        }
        if (scheduledCallback !== null) {
          var cb = scheduledCallback;
          isFlushing = true;
          try {
            var hasMoreWork = true;
            do {
              hasMoreWork = cb(true, currentMockTime);
            } while (hasMoreWork);
            if (!hasMoreWork) {
              scheduledCallback = null;
            }
            return true;
          } finally {
            isFlushing = false;
          }
        } else {
          return false;
        }
      }
      function unstable_clearYields() {
        if (yieldedValues === null) {
          return [];
        }
        var values = yieldedValues;
        yieldedValues = null;
        return values;
      }
      function unstable_flushAll() {
        if (yieldedValues !== null) {
          throw new Error('Log is not empty. Assert on the log of yielded values before ' + 'flushing additional work.');
        }
        unstable_flushAllWithoutAsserting();
        if (yieldedValues !== null) {
          throw new Error('While flushing work, something yielded a value. Use an ' + 'assertion helper to assert on the log of yielded values, e.g. ' + 'expect(Scheduler).toFlushAndYield([...])');
        }
      }
      function unstable_yieldValue(value) {
        if (console.log.name === 'disabledLog' || disableYieldValue) {
          return;
        }
        if (yieldedValues === null) {
          yieldedValues = [value];
        } else {
          yieldedValues.push(value);
        }
      }
      function unstable_advanceTime(ms) {
        if (console.log.name === 'disabledLog' || disableYieldValue) {
          return;
        }
        currentMockTime += ms;
        if (scheduledTimeout !== null && timeoutTime <= currentMockTime) {
          scheduledTimeout(currentMockTime);
          timeoutTime = -1;
          scheduledTimeout = null;
        }
      }
      function requestPaint() {
        needsPaint = true;
      }
      var unstable_Profiling = null;
      exports.reset = reset;
      exports.unstable_IdlePriority = IdlePriority;
      exports.unstable_ImmediatePriority = ImmediatePriority;
      exports.unstable_LowPriority = LowPriority;
      exports.unstable_NormalPriority = NormalPriority;
      exports.unstable_Profiling = unstable_Profiling;
      exports.unstable_UserBlockingPriority = UserBlockingPriority;
      exports.unstable_advanceTime = unstable_advanceTime;
      exports.unstable_cancelCallback = unstable_cancelCallback;
      exports.unstable_clearYields = unstable_clearYields;
      exports.unstable_continueExecution = unstable_continueExecution;
      exports.unstable_flushAll = unstable_flushAll;
      exports.unstable_flushAllWithoutAsserting = unstable_flushAllWithoutAsserting;
      exports.unstable_flushExpired = unstable_flushExpired;
      exports.unstable_flushNumberOfYields = unstable_flushNumberOfYields;
      exports.unstable_flushUntilNextPaint = unstable_flushUntilNextPaint;
      exports.unstable_forceFrameRate = forceFrameRate;
      exports.unstable_getCurrentPriorityLevel = unstable_getCurrentPriorityLevel;
      exports.unstable_getFirstCallbackNode = unstable_getFirstCallbackNode;
      exports.unstable_next = unstable_next;
      exports.unstable_now = getCurrentTime;
      exports.unstable_pauseExecution = unstable_pauseExecution;
      exports.unstable_requestPaint = requestPaint;
      exports.unstable_runWithPriority = unstable_runWithPriority;
      exports.unstable_scheduleCallback = unstable_scheduleCallback;
      exports.unstable_setDisableYieldValue = setDisableYieldValue;
      exports.unstable_shouldYield = shouldYieldToHost;
      exports.unstable_wrapCallback = unstable_wrapCallback;
      exports.unstable_yieldValue = unstable_yieldValue;
    })();
  }
})(require('process'));
