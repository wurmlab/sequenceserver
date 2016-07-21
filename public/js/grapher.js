import React from 'react';
import _ from 'underscore';

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
  // $(window).resize(function () {
  //   // $('.grapher').each(function () {
  //   //   var svg = $(React.findDOMNode(this.svgContainer));
  //   //   console.log('svg test '+$(this).children+' sec '+$(this));
  //   //   svg.draw();
  //   //   // this.graph.draw();
  //   // })
  //   // // console.log("test "+$('.grapher').refs);
  //   var test = [1, 3, , 7, ,9];
  //   // arr.fill(7);
  //   // var arr = graph();
  //   console.log('resize initiated '+Array.from(arr.values())+ ' other '+[...test]);
  //   // _.each(test, _.bind(function() {
  //   //   console.log('test '+ this);
  //   // }, this));
  //   for (const x of arr){
  //     if (!_.isUndefined(x)) {
  //       // console.log('offof '+x.hasClass());
  //       x.draw();
  //     }
  //   }
  // });
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
