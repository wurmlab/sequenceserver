import React, { useState } from 'react';
import CollapsePreferences from '../collapse_preferences';

const ReportHeader = (props) => {
    const [state, setState] = useState({ collapsed: null });
    const [renderable, _setRenderable] = useState(props.renderable === undefined ? true : props.renderable);
    const collapsePreferences = new CollapsePreferences(
        { name: props.name, state: { ...state }, setState: setState },
        props.defaultCollapsed
    );

    if (state.collapsed === null) setState({ collapsed: collapsePreferences.preferenceStoredAsCollapsed() });
    if (!renderable) return null;

    return (
        <div className={`${state.collapsed ? 'print:!hidden' : ''}`}>
            <h3 className="caption font-bold border-b-2 border-seqorange" onClick={() => collapsePreferences.toggleCollapse()}>
                {collapsePreferences.renderCollapseIcon()}
                <span> {props.name}</span>
            </h3>
            <div className='mx-1 print:mx-0'>
                {!state.collapsed && props.renderContent()}
            </div>
        </div>
    );
};

export default ReportHeader;
