import React, { Component } from 'react';
// Component for the advanced params input field.
export class Options extends Component {
    constructor(props) {
        super(props);

        this.state = {
            textValue: '',
            objectValue: this.defaultObjectValue(),
            paramsMode: 'advanced'
        };

        this.onTextValueChanged = this.onTextValueChanged.bind(this);
        this.optionsPresetsJSX = this.optionsPresetsJSX.bind(this);
        this.advancedParamsJSX = this.advancedParamsJSX.bind(this);
        this.showAdvancedOptionsHelp = this.showAdvancedOptionsHelp.bind(this);
    }


    defaultObjectValue() {
        return {
            max_target_seqs: '',
            evalue: '',
            task: ''
        };
    };

    componentDidUpdate(prevProps) {
        if (prevProps.predefinedOptions !== this.props.predefinedOptions) {
            let defaultOptions = this.props.predefinedOptions.default || {attributes: []};
            let advancedOptions = this.props.predefinedOptions['last search'] || defaultOptions || {attributes: []};
            let initialTextValue = advancedOptions.attributes.join(' ').trim();
            let parsedOptions = this.parsedOptions(initialTextValue);
            this.setState({ textValue: initialTextValue, objectValue: parsedOptions});
        }
    }

    onTextValueChanged(textValue) {
        let parsedOptions = this.parsedOptions(textValue.toString());

        this.setState({
            textValue: textValue.toString(),
            objectValue: parsedOptions
        });
    }

    parsedOptions(textValue) {
        const words = textValue.split(" ");
        let parsedOptions = this.defaultObjectValue();
        // Iterate through the words in steps of 2, treating each pair as an option and its potential value
        for (let i = 0; i < words.length; i += 2) {
            // Ensure there is a pair available
            if (words[i]) {
                if (words[i].startsWith("-")) {
                    const optionName = words[i].substring(1).trim();

                    if (words[i + 1]) {
                        // Use the second word as the value for this option
                        parsedOptions[optionName] = words[i + 1];
                    } else {
                        // No value found for this option, set it to null or a default value
                        parsedOptions[optionName] = null;
                    }
                }
            }
        }

        return parsedOptions;
    }

    optionsPresetsJSX() {
        return (
            <div id="options-presets" className="w-full">
                { Object.keys(this.props.predefinedOptions).length > 1 && <>
                    <div className="flex items-center border-b border-seqorange mb-2">
                        <h3 className="text-base md:text-lg font-medium pr-1">Settings</h3>
                        <p className="text-base text-gray-500">Choose a predefined setting or customize parameters.</p>
                    </div>
                    {this.presetListJSX()}
                </>}
            </div>
        );
    }

    presetListJSX() {
        return (
            <ul className="text-lg my-1">
                {
                    Object.entries(this.props.predefinedOptions).map(
                        ([key, config], index) => {
                            let textValue = config.attributes.join(' ').trim();
                            let description = config.description || textValue;

                            return (
                                <label key={index} className={`block w-full px-2 py-1 text-seqblue hover:bg-gray-200 hover:text-seqorange cursor-pointer`}>
                                    <input
                                        type="radio"
                                        name="predefinedOption"
                                        value={textValue}
                                        checked={textValue === this.state.textValue}
                                        onChange={() => this.onTextValueChanged(textValue)}
                                    />
                                    <strong className="ml-2">{key}:</strong>&nbsp;{description}
                                </label>
                            );
                        }
                    )
                }
            </ul>
        )
    }

    advancedParamsJSX() {
        let classNames = 'flex-grow block px-4 py-1 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base font-mono';

        if (this.state.textValue) {
            classNames += ' bg-yellow-100';
        }

        return(
             <div className={this.state.paramsMode !== 'advanced' ? 'w-full hidden' : 'w-full'}>
                <div className="flex items-end">
                    <label className="flex items-center text-base md:text-lg text-gray-500" htmlFor="advanced">
                        Parameters options as they would appear in a command-line.
                    </label>

                    {this.props.blastMethod &&
                        <button
                            className="text-seqblue text-base md:text-lg ml-2"
                            type="button"
                            onClick={this.showAdvancedOptionsHelp}
                            data-toggle="modal" data-target="#help">
                            See options
                            <i className="fa fa-question-circle ml-1 w-3 h-4 fill-current"></i>
                        </button>
                    }
                </div>

                <div className='flex-grow flex w-full'>
                    <input type="text" className={classNames}
                        onChange={e => this.onTextValueChanged(e.target.value)}
                        id="advanced"
                        name="advanced"
                        value={this.state.textValue}
                        placeholder="eg: -evalue 1.0e-5 -num_alignments 100"
                        title="View, and enter advanced parameters."
                    />
                </div>
            </div>
        )
    }

    showAdvancedOptionsHelp(e) {
        const ids = ['blastn', 'tblastn', 'blastp', 'blastx', 'tblastx'];
        const method = this.props.blastMethod.toLowerCase();
        const modal = document.querySelector("dialog.advanced-modal");

        // hide options for other algorithms and only show for selected algorithm
        for (const id of ids) {
            if (id === method) {
                document.getElementById(id).classList.remove('hidden');
            } else {
                document.getElementById(id).classList.add('hidden');
            }
        }

        modal.showModal();
    }

    render() {
        return (
            <div className="flex-grow flex flex-col items-start sm:items-center space-y-4">
                {this.optionsPresetsJSX()}

                {this.advancedParamsJSX()}
            </div>
        );
    }

}
