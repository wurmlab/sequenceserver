import React, { Component } from 'react';
// Component for the advanced params input field.
export class Options extends Component {
    constructor(props) {
        super(props);
        this.state = { preOpts: {}, value: '', method: '' };
        this.updateBox = this.updateBox.bind(this);
        this.optionsJSX = this.optionsJSX.bind(this);
        this.showAdvancedOptions = this.showAdvancedOptions.bind(this);
    }

    updateBox(value) {
        this.setState({ value: value });
    }


    optionsJSX() {
        return <span className="input-group-btn dropdown">
            <button className="btn bnt-sm btn-default dropdown-toggle"
                data-toggle="dropdown">
                <i className="fa fa-caret-down"></i>
            </button>
            <ul id='advanced-params-dropdown'
                className="dropdown-menu dropdown-menu-right">
                {
                    Object.entries(this.state.preOpts).map(
                        ([key, value], index) => {
                            value = value.join(' ');
                            if (value.trim() === this.state.value.trim())
                                var className = 'yellow-background';
                            return <li key={index} className={className}
                                onClick={() => this.updateBox(value)}>
                                <strong>{key}:</strong>&nbsp;{value}
                            </li>;
                        }
                    )
                }
            </ul>
        </span>;
    }
    showAdvancedOptions(e) {
        const ids = ['blastn', 'tblastn', 'blastp', 'blastx', 'tblastx'];
        const method = this.state.method.toLowerCase();
        // hide options for other algorithms and only show for selected algorithm
        for (const id of ids) {
            $(`#${id}`)[id === method ? 'show' : 'hide']();
        }
    }
    render() {
        var classNames = 'form-control';
        if (this.state.value.trim()) {
            classNames += ' yellow-background';
        }
        return (
            <div className="col-md-7">
                <div className="form-group">
                    <div className="col-md-12">
                        <div className="input-group">
                            <label className="control-label" htmlFor="advanced">
                                Advanced parameters:
                                {/* only show link to advanced parameters if blast method is known */}
                                {this.state.method && <sup style={{ marginLeft: '2px' }}>
                                    <a href=''
                                        onClick={this.showAdvancedOptions}
                                        data-toggle="modal" data-target="#help">
                                        <i className="fa fa-question-circle"></i>
                                    </a>
                                </sup>}
                            </label>
                            <input type="text" className={classNames}
                                onChange={e => this.updateBox(e.target.value)}
                                id="advanced" name="advanced" value={this.state.value}
                                placeholder="eg: -evalue 1.0e-5 -num_alignments 100"
                                title="View, and enter advanced parameters."
                            />
                            {Object.keys(this.state.preOpts).length > 1 && this.optionsJSX()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
