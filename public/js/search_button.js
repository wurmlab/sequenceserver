import React, { Component, createRef } from 'react';
import _ from 'underscore';

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
            titleTooltip: "",
            hideMessageTooltip: false
        };
        this.changeAlgorithm = this.changeAlgorithm.bind(this);
        this.decorate = this.decorate.bind(this);
        this.setMessageTooltipButton = this.setMessageTooltipButton.bind(this);
        this.setTitleTooltipButton = this.setTitleTooltipButton.bind(this);
        this.renderButton = this.renderButton.bind(this);
        this.inputGroup = this.inputGroup.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this)
        this.handeMouseOut = this.handeMouseOut.bind(this)
        this.inputGroupRef = createRef();
    }

    componentDidMount() {
        this.timeout = setTimeout(() => this.setState({ hideMessageTooltip: true}), 3000)
    }

    shouldComponentUpdate(props, state) {
        return !_.isEqual(state.methods, this.state.methods) ||
            state.dropdownVisible !== this.state.dropdownVisible ||
            state.messageTooltip !== this.state.messageTooltip ||
            state.titleTooltip !== this.state.titleTooltip ||
            state.hideMessageTooltip !== this.state.hideMessageTooltip;
    }

    componentDidUpdate(_prevProps, prevState) {
        if (!_.isEqual(prevState.methods, this.state.methods)) {
            if (this.state.methods.length > 0) {
                this.inputGroup().wiggle();
                this.props.onAlgoChanged(this.state.methods[0]);
            } else {
                this.props.onAlgoChanged('');
            }
        }
    }

    inputGroup() {
        return $(this.inputGroupRef.current);
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

    handeMouseOut() {
        clearTimeout(this.timeout);
        this.setState({ hideMessageTooltip: false })
    }

    handleMouseOver() {
        this.setMessageTooltipButton();
        this.setTitleTooltipButton();
        this.timeout = setTimeout(() => this.setState({ hideMessageTooltip: true}), 3000)
    }

    renderButton(method, multi, methods) {
        return (
            <div className="flex">
                <button
                    type="submit"
                    className="uppercase w-full md:w-auto flex text-xl justify-center py-2 px-16 border border-transparent rounded-md shadow-sm text-white bg-seqblue hover:bg-seqorange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-seqorange"
                    id="method"
                    name="method"
                    value={method}
                    disabled={!method}
                >
                    {this.decorate(method || 'blast')}
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
                className="my-4 md:my-2 flex justify-end w-full md:w-auto relative"
                id="methods"
                ref={this.inputGroupRef}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handeMouseOut}
            >
                <div className="relative flex flex-col items-center group">
                    <div className="flex items-center w-full">
                        {this.renderButton(method, multi, methods)}
                        { !this.state.dropdownVisible &&
                            <div className="absolute hidden bottom-11 items-center flex-col-reverse group-hover:flex w-full">
                                <div className="w-0 h-0 border-t-[8px] border-b-[7px] rotate-[270deg] border-r-[7px] -mt-1 border-t-transparent border-b-transparent border-r-black -mr-[1px]"></div>
                                <span className="relative z-10 p-2 search-button-text leading-4 text-center text-white whitespace-no-wrap bg-black shadow-lg rounded-[5px]">
                                    { !this.state.hasQuery || !this.state.hasDatabases ? (
                                        this.state.hideMessageTooltip ?  <>{this.state.titleTooltip}</> : this.state.messageTooltip
                                    ) : <> {this.state.titleTooltip}</>}
                                </span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
