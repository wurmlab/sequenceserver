import React, { Component, createRef } from 'react';
import _ from 'underscore';
import { Button, Tooltip } from "flowbite-react";

/**
 * SearchButton widget.
 */
export class SearchButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            methods: [],
            hasQuery: false,
            hasDatabases: false,
            dropdownVisible: false,
            messageTooltip: "",
            titleTooltip: ""
        };
        this.changeAlgorithm = this.changeAlgorithm.bind(this);
        this.decorate = this.decorate.bind(this);
        this.setMessageTooltipButton = this.setMessageTooltipButton.bind(this)
        this.setTitleTooltipButton = this.setTitleTooltipButton.bind(this)
        this.renderTooltip = this.renderTooltip.bind(this)
    }

    shouldComponentUpdate(props, state) {
        return !_.isEqual(state.methods, this.state.methods) || state.dropdownVisible !== this.state.dropdownVisible || state.messageTooltip !== this.state.messageTooltip || state.titleTooltip !== this.state.titleTooltip;
    }

    /**
 * Change selected algorithm.
 *
 * NOTE: Called on click on dropdown menu items.
 */
    changeAlgorithm(method) {
        var methods = this.state.methods.slice();
        methods.splice(methods.indexOf(method), 1);
        methods.unshift(method);
        this.setState({
            methods: methods,
            dropdownVisible: false,
        });
    }

    /**
 * Given, for example 'blastp', returns blast<strong>p</strong>.
 */
    decorate(name) {
        return name
            .match(/(.?)(blast)(.?)/)
            .slice(1)
            .map(function (token, _) {
                if (token) {
                    if (token !== 'blast') {
                        return <strong key={token}>{token}</strong>;
                    } else {
                        return token;
                    }
                }
            });
    }

    toggleDropdownVisibility = () => {
        this.setState(prevState => ({
            dropdownVisible: !prevState.dropdownVisible
        }));
    }
    
    setMessageTooltipButton() {
        if (!this.state.hasQuery && !this.state.hasDatabases) {
            this.setState({ messageTooltip: "You must enter a query sequence and select one or more databases above before you can run a search!" })
        } else if (this.state.hasQuery && !this.state.hasDatabases) {
            this.setState({ messageTooltip: "You must select one or more databases above before you can run a search!" })
        } else if (!this.state.hasQuery && this.state.hasDatabases) {
            this.setState({ messageTooltip: "You must enter a query sequence above before you can run a search!" })
        }
    }

    setTitleTooltipButton() {
        var title = "Click to BLAST or press Ctrl+Enter.";
        this.setState({ titleTooltip: title })
        if (this.state.methods.length > 1) {
            this.setState({
                titleTooltip: title +=
                    ' Click dropdown button on the right for other' +
                    ' BLAST algorithms that can be used.'
             })
        }
    }

    renderTooltip(method, multi, methods) {
        return (
            <div className="flex">
                <button
                    type="submit"
                    className="uppercase w-full md:w-auto flex text-xl justify-center py-2 px-16 border border-transparent rounded-md shadow-sm text-white bg-seqblue hover:bg-seqorange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seqorange"
                    id="method"
                    name="method"
                    value={method}
                    disabled={!method}
                    onMouseOver={this.setTitleTooltipButton}
                >
                    <Tooltip content={<span className="normal-case">{this.state.titleTooltip}</span>} placement="bottom" animation={false}>
                        <span>{this.decorate(method || 'blast')}</span>
                    </Tooltip>
                </button>

                {multi && (
                    <div className="ui--multi-dropdown">
                        <button
                            className="text-xl bg-seqblue rounded-r-md text-white p-2 border border-seqblue hover:bg-seqorange focus:outline-none focus:ring-1 focus:ring-seqorange -ml-8"
                            type="button"
                            onClick={this.toggleDropdownVisibility}
                        >
                            <i className="fas fa-caret-down w-6 h-6 fill-current"></i>
                            <span className="sr-only">Other methods</span>
                        </button>

                        <div id="dropdown"
                            className={`z-10 my-2 uppercase bg-blue-300 divide-y divide-gray-100 rounded-lg shadow absolute left-0 bottom-12 w-full text-xl text-center ${this.state.dropdownVisible ? '' : 'hidden'}`}>
                            <ul className="text-gray-700" aria-labelledby="dropdownDefaultButton">
                                {_.map(
                                    methods.slice(1),
                                    _.bind(function (method) {
                                        return (
                                            <li
                                                key={method}
                                                onClick={_.bind(function () {
                                                    this.changeAlgorithm(method);
                                                }, this)}
                                            >
                                                <a href="#" className="block px-4 py-2 hover:bg-blue-400 rounded-lg">{method}</a>
                                            </li>
                                        );
                                    }, this)
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    render() {
        var methods = this.state.methods;
        var method = methods[0];
        var multi = methods.length > 1;

        return (
            <div
                // className={multi ? 'flex' : 'flex'}
                className="my-4 md:my-2 flex justify-end w-full md:w-auto relative"
                id="methods"
                onMouseOver={this.setMessageTooltipButton}
            >
                {!multi ? (
                    <Tooltip content={<span className="text-center block">{this.state.messageTooltip}</span>} placement="bottom" animation={false}>
                       {this.renderTooltip(method, multi)}
                    </Tooltip>
                ) : (
                    <>
                        {this.renderTooltip(method, multi, methods)}
                    </>
                )}
            </div>
        );
    }
}
