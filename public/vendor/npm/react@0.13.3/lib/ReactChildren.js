/* */ 
(function(process) {
  'use strict';
  var PooledClass = require("./PooledClass");
  var ReactFragment = require("./ReactFragment");
  var traverseAllChildren = require("./traverseAllChildren");
  var warning = require("./warning");
  var twoArgumentPooler = PooledClass.twoArgumentPooler;
  var threeArgumentPooler = PooledClass.threeArgumentPooler;
  function ForEachBookKeeping(forEachFunction, forEachContext) {
    this.forEachFunction = forEachFunction;
    this.forEachContext = forEachContext;
  }
  PooledClass.addPoolingTo(ForEachBookKeeping, twoArgumentPooler);
  function forEachSingleChild(traverseContext, child, name, i) {
    var forEachBookKeeping = traverseContext;
    forEachBookKeeping.forEachFunction.call(forEachBookKeeping.forEachContext, child, i);
  }
  function forEachChildren(children, forEachFunc, forEachContext) {
    if (children == null) {
      return children;
    }
    var traverseContext = ForEachBookKeeping.getPooled(forEachFunc, forEachContext);
    traverseAllChildren(children, forEachSingleChild, traverseContext);
    ForEachBookKeeping.release(traverseContext);
  }
  function MapBookKeeping(mapResult, mapFunction, mapContext) {
    this.mapResult = mapResult;
    this.mapFunction = mapFunction;
    this.mapContext = mapContext;
  }
  PooledClass.addPoolingTo(MapBookKeeping, threeArgumentPooler);
  function mapSingleChildIntoContext(traverseContext, child, name, i) {
    var mapBookKeeping = traverseContext;
    var mapResult = mapBookKeeping.mapResult;
    var keyUnique = !mapResult.hasOwnProperty(name);
    if ("production" !== process.env.NODE_ENV) {
      ("production" !== process.env.NODE_ENV ? warning(keyUnique, 'ReactChildren.map(...): Encountered two children with the same key, ' + '`%s`. Child keys must be unique; when two children share a key, only ' + 'the first child will be used.', name) : null);
    }
    if (keyUnique) {
      var mappedChild = mapBookKeeping.mapFunction.call(mapBookKeeping.mapContext, child, i);
      mapResult[name] = mappedChild;
    }
  }
  function mapChildren(children, func, context) {
    if (children == null) {
      return children;
    }
    var mapResult = {};
    var traverseContext = MapBookKeeping.getPooled(mapResult, func, context);
    traverseAllChildren(children, mapSingleChildIntoContext, traverseContext);
    MapBookKeeping.release(traverseContext);
    return ReactFragment.create(mapResult);
  }
  function forEachSingleChildDummy(traverseContext, child, name, i) {
    return null;
  }
  function countChildren(children, context) {
    return traverseAllChildren(children, forEachSingleChildDummy, null);
  }
  var ReactChildren = {
    forEach: forEachChildren,
    map: mapChildren,
    count: countChildren
  };
  module.exports = ReactChildren;
})(require("process"));
