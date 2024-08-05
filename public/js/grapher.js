import _ from 'underscore';
import React, { createRef } from 'react';

import './svgExporter'; // create handlers for SVG and PNG download buttons
import CollapsePreferences from './collapse_preferences';

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
            this.name = Graph.name(this.props);
            this.collapsePreferences = new CollapsePreferences(this);
            let isCollapsed = this.collapsePreferences.preferenceStoredAsCollapsed();
            this.state = { collapsed: Graph.canCollapse() && (this.props.collapsed || isCollapsed) };
            this.svgContainerRef = createRef();
        }

        graphId() {
            return Graph.graphId(this.props);
        }

        render() {
            // Do not render when Graph.name() is null
            if (Graph.name(this.props) === null) {
                return null;
            } else {
                var cssClasses = Graph.className() + ' grapher';
                return (
                    <div className={cssClasses}>
                        {this.header()}
                        {this.svgContainerJSX()}
                    </div>
                );
            }
        }

        header() {
            if(Graph.canCollapse()) {
                return <div className="grapher-header">
                    <h4
                        className="caption text-sm"
                        onClick={() => this.collapsePreferences.toggleCollapse()}
                    >
                        {this.collapsePreferences.renderCollapseIcon()}
              &nbsp;{Graph.name(this.props)}
                    </h4>
                    {!this.state.collapsed && this.graphLinksJSX()}
                </div>;
            } else {
                return <div className="grapher-header">
                    {!this.state.collapsed && this.graphLinksJSX()}
                </div>;
            }
        }

        graphLinksJSX() {
            return (
                <div className="hit-links graph-links h-4">
                    <a href="#" className="btn-link text-sm text-seqblue hover:text-seqorange cursor-pointer export-to-svg">
                        <i className="fa fa-download" /> SVG
                    </a>
                    <span className="line px-1">|</span>
                    <a href="#" className="btn-link text-sm text-seqblue hover:text-seqorange cursor-pointer export-to-png">
                        <i className="fa fa-download" /> PNG
                    </a>
                </div>
            );
        }

        svgContainerJSX() {
            var cssClasses = Graph.className() + ' svg-container collapse';
            if (!this.state.collapsed) cssClasses += ' !visible';
            return (
                <div
                    ref={this.svgContainerRef}
                    id={this.graphId()}
                    className={cssClasses}
                ></div>
            );
        }

        componentDidMount() {
            Graphers[this.graphId()] = this;

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
                .find('svg')
                .attr('data-name', Graph.dataName(this.props));
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
