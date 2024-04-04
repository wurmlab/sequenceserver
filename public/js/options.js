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
            if (id === method) {
                document.getElementById(id).classList.remove('hidden')
            } else {
                document.getElementById(id).classList.add('hidden');
            }
        }
        document.querySelector('[data-help-modal]').classList.remove('hidden')
    }
    render() {
        var classNames = 'flex-grow block px-4 py-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base';
        if (this.state.value.trim()) {
            classNames += ' bg-yellow-100';
        }
        return (
            <div className="flex-grow flex items-center space-x-2">
                <label className="flex items-center" htmlFor="advanced">
                    Advanced parameters:
                    {/* only show link to advanced parameters if blast method is known */}
                    {this.state.method && <sup className="mx-1 text-seqblue">
                        <a href=''
                            onClick={this.showAdvancedOptions}
                            data-toggle="modal" data-target="#help">
                            <i className="fa fa-question-circle w-3 h-4 fill-current"></i>
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
        );
    }

}
