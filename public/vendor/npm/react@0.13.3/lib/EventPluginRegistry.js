/* */ 
(function(process) {
  'use strict';
  var invariant = require("./invariant");
  var EventPluginOrder = null;
  var namesToPlugins = {};
  function recomputePluginOrdering() {
    if (!EventPluginOrder) {
      return;
    }
    for (var pluginName in namesToPlugins) {
      var PluginModule = namesToPlugins[pluginName];
      var pluginIndex = EventPluginOrder.indexOf(pluginName);
      ("production" !== process.env.NODE_ENV ? invariant(pluginIndex > -1, 'EventPluginRegistry: Cannot inject event plugins that do not exist in ' + 'the plugin ordering, `%s`.', pluginName) : invariant(pluginIndex > -1));
      if (EventPluginRegistry.plugins[pluginIndex]) {
        continue;
      }
      ("production" !== process.env.NODE_ENV ? invariant(PluginModule.extractEvents, 'EventPluginRegistry: Event plugins must implement an `extractEvents` ' + 'method, but `%s` does not.', pluginName) : invariant(PluginModule.extractEvents));
      EventPluginRegistry.plugins[pluginIndex] = PluginModule;
      var publishedEvents = PluginModule.eventTypes;
      for (var eventName in publishedEvents) {
        ("production" !== process.env.NODE_ENV ? invariant(publishEventForPlugin(publishedEvents[eventName], PluginModule, eventName), 'EventPluginRegistry: Failed to publish event `%s` for plugin `%s`.', eventName, pluginName) : invariant(publishEventForPlugin(publishedEvents[eventName], PluginModule, eventName)));
      }
    }
  }
  function publishEventForPlugin(dispatchConfig, PluginModule, eventName) {
    ("production" !== process.env.NODE_ENV ? invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName), 'EventPluginHub: More than one plugin attempted to publish the same ' + 'event name, `%s`.', eventName) : invariant(!EventPluginRegistry.eventNameDispatchConfigs.hasOwnProperty(eventName)));
    EventPluginRegistry.eventNameDispatchConfigs[eventName] = dispatchConfig;
    var phasedRegistrationNames = dispatchConfig.phasedRegistrationNames;
    if (phasedRegistrationNames) {
      for (var phaseName in phasedRegistrationNames) {
        if (phasedRegistrationNames.hasOwnProperty(phaseName)) {
          var phasedRegistrationName = phasedRegistrationNames[phaseName];
          publishRegistrationName(phasedRegistrationName, PluginModule, eventName);
        }
      }
      return true;
    } else if (dispatchConfig.registrationName) {
      publishRegistrationName(dispatchConfig.registrationName, PluginModule, eventName);
      return true;
    }
    return false;
  }
  function publishRegistrationName(registrationName, PluginModule, eventName) {
    ("production" !== process.env.NODE_ENV ? invariant(!EventPluginRegistry.registrationNameModules[registrationName], 'EventPluginHub: More than one plugin attempted to publish the same ' + 'registration name, `%s`.', registrationName) : invariant(!EventPluginRegistry.registrationNameModules[registrationName]));
    EventPluginRegistry.registrationNameModules[registrationName] = PluginModule;
    EventPluginRegistry.registrationNameDependencies[registrationName] = PluginModule.eventTypes[eventName].dependencies;
  }
  var EventPluginRegistry = {
    plugins: [],
    eventNameDispatchConfigs: {},
    registrationNameModules: {},
    registrationNameDependencies: {},
    injectEventPluginOrder: function(InjectedEventPluginOrder) {
      ("production" !== process.env.NODE_ENV ? invariant(!EventPluginOrder, 'EventPluginRegistry: Cannot inject event plugin ordering more than ' + 'once. You are likely trying to load more than one copy of React.') : invariant(!EventPluginOrder));
      EventPluginOrder = Array.prototype.slice.call(InjectedEventPluginOrder);
      recomputePluginOrdering();
    },
    injectEventPluginsByName: function(injectedNamesToPlugins) {
      var isOrderingDirty = false;
      for (var pluginName in injectedNamesToPlugins) {
        if (!injectedNamesToPlugins.hasOwnProperty(pluginName)) {
          continue;
        }
        var PluginModule = injectedNamesToPlugins[pluginName];
        if (!namesToPlugins.hasOwnProperty(pluginName) || namesToPlugins[pluginName] !== PluginModule) {
          ("production" !== process.env.NODE_ENV ? invariant(!namesToPlugins[pluginName], 'EventPluginRegistry: Cannot inject two different event plugins ' + 'using the same name, `%s`.', pluginName) : invariant(!namesToPlugins[pluginName]));
          namesToPlugins[pluginName] = PluginModule;
          isOrderingDirty = true;
        }
      }
      if (isOrderingDirty) {
        recomputePluginOrdering();
      }
    },
    getPluginModuleForEvent: function(event) {
      var dispatchConfig = event.dispatchConfig;
      if (dispatchConfig.registrationName) {
        return EventPluginRegistry.registrationNameModules[dispatchConfig.registrationName] || null;
      }
      for (var phase in dispatchConfig.phasedRegistrationNames) {
        if (!dispatchConfig.phasedRegistrationNames.hasOwnProperty(phase)) {
          continue;
        }
        var PluginModule = EventPluginRegistry.registrationNameModules[dispatchConfig.phasedRegistrationNames[phase]];
        if (PluginModule) {
          return PluginModule;
        }
      }
      return null;
    },
    _resetEventPlugins: function() {
      EventPluginOrder = null;
      for (var pluginName in namesToPlugins) {
        if (namesToPlugins.hasOwnProperty(pluginName)) {
          delete namesToPlugins[pluginName];
        }
      }
      EventPluginRegistry.plugins.length = 0;
      var eventNameDispatchConfigs = EventPluginRegistry.eventNameDispatchConfigs;
      for (var eventName in eventNameDispatchConfigs) {
        if (eventNameDispatchConfigs.hasOwnProperty(eventName)) {
          delete eventNameDispatchConfigs[eventName];
        }
      }
      var registrationNameModules = EventPluginRegistry.registrationNameModules;
      for (var registrationName in registrationNameModules) {
        if (registrationNameModules.hasOwnProperty(registrationName)) {
          delete registrationNameModules[registrationName];
        }
      }
    }
  };
  module.exports = EventPluginRegistry;
})(require("process"));
