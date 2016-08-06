import React from 'react';
import _ from 'underscore';

export function grapher_node() {
  return $(React.findDOMNode(this.refs.grapher));
}

var arr = new Array();

export function graph() {
  return arr;
}

export function setupResponsiveness() {
  $.fn.resize_graph = function () {
    $('.grapher').each(function (index) {
      console.log('test '+index);
    })
  }
}

export function grapher_render() {
  // NOTE:
  //   Adding 'grapher' class to query container is required by
  //   ImageExporter.
  return (
    <div className="grapher" ref="grapher">
      <div
          className="graph-links">
          <a href = "#" className="export-to-svg">
              <i className="fa fa-download"/>
              <span>{"  SVG  "}</span>
          </a>
          <span>{" | "}</span>
          <a href = "#" className="export-to-png">
              <i className="fa fa-download"/>
              <span>{"  PNG  "}</span>
          </a>
      </div>
      <div ref="svgContainer" className="svg_container"></div>
    </div>
  )
}
