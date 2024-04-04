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
        var classNames = 'form-control';
        if (this.state.value.trim()) {
            classNames += ' yellow-background';
        }
        return (
            <div className="flex-grow flex items-center space-x-2">
                <label className="flex" htmlFor="advanced">
                    Advanced parameters:
                    {/* only show link to advanced parameters if blast method is known */}
                    {this.state.method && <sup className="mx-1 text-seqblue">
                        <a href=''
                            onClick={this.showAdvancedOptions}
                            data-toggle="modal" data-target="#help">
                            <svg className="w-3 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg>
                        </a>
                    </sup>}
                </label>
                <input type="text" className={classNames}
                    onChange={e => this.updateBox(e.target.value)}
                    id="advanced" name="advanced" value={this.state.value}
                    placeholder="eg: -evalue 1.0e-5 -num_alignments 100"
                    className="flex-grow block px-4 py-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base"
                    title="View, and enter advanced parameters."
                />
                {Object.keys(this.state.preOpts).length > 1 && this.optionsJSX()}
            </div>
        );
    }

}
