import _ from "underscore";
import React, { createRef } from "react";

import "./svgExporter"; // create handlers for SVG and PNG download buttons

// Each instance of Grapher is added to this object once the component has been
// mounted. This is so that grapher can be iterated over and redrawn on window
// resize event.
var Graphers = {};

// Grapher is a function that takes a Graph class and returns a React component.
// This React component provides HTML boilerplate to add heading, to make the
// graphs collapsible, to redraw graphs when window is resized, and SVG and PNG
// export buttons and functionality.
export default function Grapher(Graph) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { collapsed: this.props.collapsed };
      this.svgContainerRef = createRef();
    }

    collapseId() {
      return Graph.collapseId(this.props);
    }

    render() {
      var cssClasses = Graph.className() + " grapher";
      return (
        <div ref="grapher" className={cssClasses}>
          <div className="grapher-header">
            <h4
              className="caption"
              data-toggle="collapse"
              data-target={"#" + this.collapseId()}
            >
              {this.state.collapsed ? this.plusIcon() : this.minusIcon()}
              &nbsp;{Graph.name()}
            </h4>
            {!this.state.collapsed && this.graphLinksJSX()}
          </div>
          {this.svgContainerJSX()}
        </div>
      );
    }

    minusIcon() {
      return <i className="fa fa-minus-square-o"></i>;
    }

    plusIcon() {
      return <i className="fa fa-plus-square-o"></i>;
    }

    graphLinksJSX() {
      return (
        <div className="hit-links graph-links">
          <a href="#" className="btn-link export-to-svg">
            <i className="fa fa-download" /> SVG
          </a>
          <span className="line">|</span>
          <a href="#" className="btn-link export-to-png">
            <i className="fa fa-download" /> PNG
          </a>
        </div>
      );
    }

    svgContainerJSX() {
      var cssClasses = Graph.className() + " svg-container collapse";
      if (!this.state.collapsed) cssClasses += " in";
      return (
        <div
          ref={this.svgContainerRef}
          id={this.collapseId()}
          className={cssClasses}
        ></div>
      );
    }

    componentDidMount() {
      Graphers[this.collapseId()] = this;

      // Draw visualisation for the first time. Visualisations are
      // redrawn when browser window is resized.
      this.draw();
    }

    componentDidUpdate() {
      // Re-draw visualisation when the component change state.
      this.draw();
    }
    svgContainer() {
      return $(this.svgContainerRef.current);
    }

    draw() {
      // Clean slate.
      this.svgContainer().empty();
      this.graph = null;

      // Draw if uncollapsed.
      if (this.state.collapsed) {
        return;
      }
      this.graph = new Graph(this.svgContainer(), this.props);
      this.svgContainer()
        .find("svg")
        .attr("data-name", Graph.dataName(this.props));
    }
  };
}

// Redraw if window resized.
$(window).resize(
  _.debounce(function () {
    _.each(Graphers, (grapher) => {
      grapher.draw();
    });
  }, 125)
);

// Swap-icon and toggle .graph-links on collapse.
$("body").on("hidden.bs.collapse", ".collapse", function () {
  var component = Graphers[$(this).attr("id")];
  if (component) {
    component.setState({ collapsed: true });
  }
});
$("body").on("shown.bs.collapse", ".collapse", function () {
  var component = Graphers[$(this).attr("id")];
  if (component) {
    component.setState({ collapsed: false });
  }
});
