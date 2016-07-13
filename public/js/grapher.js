import React from 'react';

// export default class Grapher {
export function svgContainer() {
    return $(React.findDOMNode(this.refs.svgContainer));
  }

export function componentDidMount() {
    var svgContainer = this.svgContainer();
    svgContainer
      .on('mouseover', function() {
        $(this).find('.graph-links').show();
      })
      .on('mouseleave', function() {
        $(this).find('.graph-links').hide();
      });
  }

export function render() {
    var comp = (
      <div className="grapher">
        <div
            className="graph-links" style={{display:"none"}}>
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
        <div ref="svgContainer"></div>
      </div>
    );
    return comp;
  }
// }
