import _ from 'underscore';
import React, { createRef, useState, useEffect, useCallback } from 'react';

import './svgExporter'; // create handlers for SVG and PNG download buttons
import CollapsePreferences from './collapse_preferences';
import useDetectPrint from "react-detect-print";

// Grapher is a function that takes a Graph class and returns a React component.
// This React component provides HTML boilerplate to add heading, to make the
// graphs collapsible, to redraw graphs when window is resized, and SVG and PNG
// export buttons and functionality.
export default function Grapher(Graph) {
    return function Component(props) {
        const alwaysShowName = Graph.alwaysShowName === undefined ? false : Graph.alwaysShowName();
        const printing = useDetectPrint();
        const name = Graph.name(props);
        const [width, setWidth] = useState(window.innerWidth);
        const [collapsed, setCollapsed] = useState(false);
        const svgContainerRef = createRef();
        let graph = null;

        const graphId = () => Graph.graphId(props)

        const graphLinksJSX = () => {
            return (
                <div className="hit-links float-right text-right text-blue-300 h-4 print:hidden">
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

        const header = () => {
            if(Graph.canCollapse()) {
                return <div className="grapher-header pr-px">
                    <h4
                        className="inline-block pl-px m-0 caption cursor-pointer text-sm"
                        onClick={() => collapsePreferences.toggleCollapse()}
                    >
                        {collapsePreferences.renderCollapseIcon()}
                        <span className="print:hidden">&nbsp;</span>{Graph.name(props)}
                    </h4>
                    {!collapsed && graphLinksJSX()}
                </div>;
            } else if (alwaysShowName) {
                return <div className="grapher-histogram-header" style={{ position: 'relative' }}>
                    <h4 className="caption">&nbsp;{Graph.name(props)}</h4>
                    <div className="pull-right" style={{ position: 'absolute', top: 0, right: 0 }}>
                        {!collapsed && graphLinksJSX()}
                    </div>
                </div>;
            } else {
                return <div className="pr-px">
                    {!collapsed && graphLinksJSX()}
                </div>;
            }
        }

        const svgContainerJSX = () => {
            var cssClasses = Graph.className() + ' svg-container hidden';
            if (!collapsed) cssClasses += ' !block';
            return (
                <div
                    ref={svgContainerRef}
                    id={graphId()}
                    className={cssClasses}
                ></div>
            );
        }

        const svgContainer = () => {
            return $(svgContainerRef.current);
        }

        const draw = (printing = false) => {
            let graphWidth = 'auto';
            if (printing) graphWidth = '900';
            // Clean slate.
            svgContainer().empty();
            graph = null;

            // Draw if uncollapsed.
            if (collapsed) return;

            svgContainer().width(graphWidth);
            graph = new Graph(svgContainer(), props);
            svgContainer()
                .find('svg')
                .attr('data-name', Graph.dataName(props));
        }

        useEffect(() => {
            // Attach a debounced listener to handle window resize events 
            // Updates the width state with the current window width, throttled to run at most once every 125ms
            const handleResize = _.debounce(() => setWidth(window.innerWidth), 125);
            window.addEventListener("resize", handleResize);

            const isCollapsed = collapsePreferences.preferenceStoredAsCollapsed();
            setCollapsed(Graph.canCollapse() && (props.collapsed || isCollapsed))
            draw();

            return () => window.removeEventListener("resize", handleResize)
        }, [])

        useEffect(() => {
            draw(printing);
        }, [printing, width])

        const setState = (state) => {
            setCollapsed(state.collapsed)
        }

        const collapsePreferences = new CollapsePreferences({name: name, state: { collapsed: collapsed }, setState: setState});

        if (Graph.name(props) === null) {
            return(null);
        } else {
            const printCss = collapsed ? 'print:hidden' : '';
            const cssClasses = Graph.className() + ' grapher' + printCss;
            return (
                <div className={cssClasses}>
                    {header()}
                    {svgContainerJSX()}
                </div>
            )
        }
    }
}
