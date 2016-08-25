import _ from 'underscore';
import React from 'react';

import './svgExporter'; // create handlers for SVG and PNG download buttons

var Graphers = [];

export default function Grapher(Graph) {

    return class extends React.Component {
        constructor(props) {
            super(props);
        }

        svgContainer () {
            return $(React.findDOMNode(this.refs.svgContainer));
        }

        draw () {
            this.svgContainer().empty();
            this.graph = new Graph(this.svgContainer(), this.props);
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
            Graphers.push(this);
            this.draw();
            this.hide_dispay = $(".caption").on('click', function() {
                $(this).find('i').toggleClass('fa-eye fa-eye-slash');
                var graph_links = $(this).next();
                if (graph_links.is(':visible')) {
                    graph_links.hide();
                } else {
                    graph_links.show();
                }
            })
        }

    };
}

// Redraw if window resized.
$(window).resize(_.debounce(function () {
    _.each(Graphers, (grapher) => {
        grapher.draw();
    });
}, 125));
