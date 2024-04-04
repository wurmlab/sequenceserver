import React, { Component, createRef } from 'react';
import _ from 'underscore';
import './jquery_world';

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
        };
        this.inputGroup = this.inputGroup.bind(this);
        this.submitButton = this.submitButton.bind(this);
        this.initTooltip = this.initTooltip.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.changeAlgorithm = this.changeAlgorithm.bind(this);
        this.decorate = this.decorate.bind(this);
        this.inputGroupRef = createRef();
        this.submitButtonRef = createRef();
    }
    componentDidMount() {
        this.initTooltip();
    }

    shouldComponentUpdate(props, state) {
        return !_.isEqual(state.methods, this.state.methods);
    }

    componentDidUpdate() {
        if (this.state.methods.length > 0) {
            this.inputGroup().wiggle();
            this.props.onAlgoChanged(this.state.methods[0]);
        } else {
            this.props.onAlgoChanged('');
        }
    }
    // Internal helpers. //

    /**
 * Returns jquery wrapped input group.
 */
    inputGroup() {
        return $(this.inputGroupRef.current);
    }

    /**
 * Returns jquery wrapped submit button.
 */
    submitButton() {
        return $(this.submitButtonRef.current);
    }

    /**
 * Initialise tooltip on input group and submit button.
 */
    initTooltip() {
        this.inputGroup().tooltip({
            trigger: 'manual',
            title: _.bind(function () {
                if (!this.state.hasQuery && !this.state.hasDatabases) {
                    return 'You must enter a query sequence and select one or more databases above before you can run a search!';
                } else if (this.state.hasQuery && !this.state.hasDatabases) {
                    return 'You must select one or more databases above before you can run a search!';
                } else if (!this.state.hasQuery && this.state.hasDatabases) {
                    return 'You must enter a query sequence above before you can run a search!';
                }
            }, this),
        });

        this.submitButton().tooltip({
            title: _.bind(function () {
                var title = 'Click to BLAST or press Ctrl+Enter.';
                if (this.state.methods.length > 1) {
                    title +=
                        ' Click dropdown button on the right for other' +
                        ' BLAST algorithms that can be used.';
                }
                return title;
            }, this),
        });
    }

    /**
 * Show tooltip on input group.
 */
    showTooltip() {
        this.inputGroup()._tooltip('show');
    }

    /**
 * Hide tooltip on input group.
 */
    hideTooltip() {
        this.inputGroup()._tooltip('hide');
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

    render() {
        var methods = this.state.methods;
        var method = methods[0];
        var multi = methods.length > 1;

        return (
            <div
                // className={multi ? 'flex' : 'flex'}
                className="flex justify-end w-full md:w-auto"
                id="methods"
                ref={this.inputGroupRef}
                onMouseOver={this.showTooltip}
                onMouseOut={this.hideTooltip}
            >
                <button
                    type="submit"
                    className="w-full md:w-auto flex text-xl justify-center py-2 px-16 border border-transparent rounded-md shadow-sm font-medium text-white bg-seqblue hover:bg-seqorange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seqorange"
                    id="method"
                    ref={this.submitButtonRef}
                    name="method"
                    value={method}
                    disabled={!method}
                >
                    {this.decorate(method || 'blast')}
                </button>

                {multi && (
                    <div className="input-group-btn">
                        <button
                            className="btn btn-primary dropdown-toggle"
                            data-toggle="dropdown"
                        >
                            <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-right">
                            {_.map(
                                methods.slice(1),
                                _.bind(function (method) {
                                    return (
                                        <li
                                            key={method}
                                            className="text-uppercase"
                                            onClick={_.bind(function () {
                                                this.changeAlgorithm(method);
                                            }, this)}
                                        >
                                            {method}
                                        </li>
                                    );
                                }, this)
                            )}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
}
