import React from 'react';
import _ from 'underscore';
import './exporter'
import './image_exporter';

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

// SVG and PNG download links.
new ImageExporter('.grapher', '.export-to-svg', '.export-to-png');

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
                <div className="grapher" ref="grapher">
                    <h5
                        className="caption">
                        {Graph.name()}
                    </h5>
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
                    <div ref="svgContainer"
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
