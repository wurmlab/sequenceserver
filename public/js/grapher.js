import _ from 'underscore';
import React from 'react';

import './svgExporter'; // create handlers for SVG and PNG download buttons

var Graphers = [];

// Redraw if window resized.
(function () {
    var $window = $(window)
    $(window).resize(_.debounce(function () {
            _.each(Graphers, (grapher) => {
                if (grapher.graph.width !==
                    grapher.svgContainer().width) {
                    grapher.graph.draw();
                }
            });
    }, 125));
}());

export default function Grapher(Graph) {

    return class extends React.Component {
        constructor(props) {
            super(props);
        }

        svgContainer () {
            return $(React.findDOMNode(this.refs.svgContainer));
        }

        render () {
            return (
                <div
                    className="grapher" ref="grapher">
                    <div
                        className="grapher-header">
                        <h5
                            className="caption"
                            data-toggle="collapse"
                            data-target={"#Collapse_"+Graph.collapseId(this.props)}>
                            <i className="fa fa-chevron-down"></i>
                            &nbsp;
                            {Graph.name()}
                        </h5>
                        <div
                            className="hit-links graph-links">
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
                    </div>
                    <div ref="svgContainer" id={"Collapse_"+Graph.collapseId(this.props)}
                        className={"svg-container " + Graph.className()}>
                    </div>
                </div>
            );
        }

        componentDidMount () {
            this.graph = new Graph(this.svgContainer(), this.props);
            Graphers.push(this);
        }
    };
}
