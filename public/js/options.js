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
        return <div id="advanced-params-dropdown" className="relative -ml-4 group">
            <button className="h-full border border-gray-300 rounded-r p-1 px-2 bg-white hover:bg-gray-200" type="button">
                <i className="fa fa-caret-down h-4 w-4"></i>
                <span className="sr-only">Advanced parameters</span>
            </button>
            <div className='z-20 group-hover:block hidden absolute top-full right-0 min-w-fit lg:min-w-[40rem]'>
                <ul className="font-mono my-1 border rounded divide-y">
                    {
                        Object.entries(this.state.preOpts).map(
                            ([key, value], index) => {
                                value = value.join(' ');
                                var bgClass = 'bg-white';
                                if (value.trim() === this.state.value.trim())
                                    bgClass = 'bg-yellow-100';
                                return <li key={index} className={`px-2 py-1 hover:bg-gray-200 cursor-pointer ${bgClass}`}
                                    onClick={() => this.updateBox(value)}>
                                    <strong>{key}:</strong>&nbsp;{value}
                                </li>;
                            }
                        )
                    }
                </ul>
            </div>
        </div>;
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
            <div className="flex-grow flex flex-col sm:flex-row items-start sm:items-center">
                <label className="flex items-center mx-2" htmlFor="advanced">
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
                <div className='flex-grow flex w-full sm:w-auto'>
                    <input type="text" className={classNames}
                        onChange={e => this.updateBox(e.target.value)}
                        id="advanced" name="advanced" value={this.state.value}
                        placeholder="eg: -evalue 1.0e-5 -num_alignments 100"
                        title="View, and enter advanced parameters."
                    />
                    {Object.keys(this.state.preOpts).length > 1 && this.optionsJSX()}
                </div>
            </div>
        );
    }

}
