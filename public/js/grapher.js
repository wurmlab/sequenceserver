import React from 'react';

// export default class Grapher {
//   // svgContainer() {
//   //   return $(React.findDOMNode(this.refs.svgContainer));
//   // }
//   //
//   // componentDidMount() {
//   //   var svgContainer = this.svgContainer();
//   //   svgContainer
//   //     .on('mouseover', function() {
//   //       $(this).find('.graph-links').show();
//   //     })
//   //     .on('mouseleave', function() {
//   //       $(this).find('.graph-links').hide();
//   //     });
//   // }
//
//   render() {
//     return(
//       <div className="length_distribution">
//         <div
//             className="graph-links">
//             <a href = "#" className="export-to-svg">
//                 <i className="fa fa-download"/>
//                 <span>{"  SVG  "}</span>
//             </a>
//             <span>{" | "}</span>
//             <a href = "#" className="export-to-png">
//                 <i className="fa fa-download"/>
//                 <span>{"  PNG  "}</span>
//             </a>
//         </div>
//       </div>
//     );
//   }
// }

export function graph_links(svgContainer) {
  svgContainer
        .on('mouseover', function() {
          $(this).find('.graph-links').show();
        })
        .on('mouseleave', function() {
          $(this).find('.graph-links').hide();
        });
}

export function grapher_node() {
  return $(React.findDOMNode(this.refs.grapher));
}

export function grapher_render() {
  return (
    <div className="grapher" ref="grapher">
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
      <div ref="svgContainer" className="svgContainer"></div>
    </div>
  )
}
