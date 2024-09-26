import React, { Component } from 'react';
import _ from 'underscore';

export class Databases extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            currentlySelectedDatabases: [],
        };

        this.preSelectedDbs = this.props.preSelectedDbs;
        this.databases = this.databases.bind(this);
        this.nselected = this.nselected.bind(this);
        this.categories = this.categories.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.renderDatabases = this.renderDatabases.bind(this);
        this.renderDatabase = this.renderDatabase.bind(this);
    }

    componentDidUpdate(_prevProps, prevState) {
        // If there's only one database, select it.
        if (this.databases() && this.databases().length === 1 && this.state.currentlySelectedDatabases.length === 0) {
            this.setState({currentlySelectedDatabases: this.databases()});
        }

        if (this.preSelectedDbs && this.preSelectedDbs.length !== 0) {
            this.setState({currentlySelectedDatabases: this.preSelectedDbs});
            this.preSelectedDbs = null;
        }
        const type = this.state.currentlySelectedDatabases[0] ? this.state.currentlySelectedDatabases[0].type : '';
        if (type != this.state.type) {
            this.setState({ type: type });
            this.props.onDatabaseTypeChanged(type);
        }

        if (prevState.currentlySelectedDatabases !== this.state.currentlySelectedDatabases) {
            // Call the prop function with the new state
            this.props.onDatabaseSelectionChanged(this.state.currentlySelectedDatabases);
        }

    }

    databases(category) {
        var databases = this.props.databases;
        if (category) {
            databases = _.select(databases, (database) => database.type === category);
        }

        return _.sortBy(databases, 'title');
    }

    nselected() {
        return this.state.currentlySelectedDatabases.length;
    }

    categories() {
        return _.uniq(_.map(this.props.databases, _.iteratee('type'))).sort();
    }

    handleToggle(toggleState, type) {
        switch (toggleState) {
        case '[Select all]':
            this.setState({ currentlySelectedDatabases: this.databases(type) });
            break;
        case '[Deselect all]':
            this.setState({ currentlySelectedDatabases: [] });
            break;
        }
    }

    renderDatabases(category) {
    // Panel name and column width.
        var panelTitle = category[0].toUpperCase() + category.substring(1).toLowerCase() + ' databases';
        var columnClass = this.categories().length === 1 ? 'col-span-2' : '';

        // Toggle button.
        var toggleState = '[Select all]';
        var toggleClass = 'px-2 text-lg';
        var toggleShown = this.databases(category).length > 1;
        var toggleDisabled = this.state.type && this.state.type !== category;
        if (toggleShown && toggleDisabled) {
            toggleClass += ' text-gray-400';
        } else {
            toggleClass += ' text-seqblue';
        }
        if (!toggleShown) toggleClass += ' hidden';
        if (this.nselected() === this.databases(category).length) {
            toggleState = '[Deselect all]';
        }

        // JSX.
        return (
            <div className={columnClass} key={'DB_' + category}>
                <div>
                    <div className="border-b border-seqorange mb-2">
                        <h4 className="font-medium inline text-lg">
                            {panelTitle}
                        </h4>
                        <button
                            type="button"
                            className={toggleClass}
                            disabled={toggleDisabled}
                            onClick={function () {
                                this.handleToggle(toggleState, category);
                            }.bind(this)}
                        >
                            {toggleState}
                        </button>
                    </div>
                    <ul className={'databases ' + category}>
                        {_.map(
                            this.databases(category),
                            _.bind(function (database, index) {
                                return (
                                    <li key={'DB_' + category + index} className="h-6 text-lg">
                                        {this.renderDatabase(database)}
                                    </li>
                                );
                            }, this)
                        )}
                    </ul>
                </div>
            </div>
        );
    }

    handleDatabaseSelectionClick(database) {
        const isSelected = this.state.currentlySelectedDatabases.some(db => db.id === database.id);

        if (isSelected) {
            this.setState(prevState => ({
                currentlySelectedDatabases: prevState.currentlySelectedDatabases.filter(db => db.id !== database.id)
            }));
        } else {
            this.setState(prevState => ({
                currentlySelectedDatabases: [...prevState.currentlySelectedDatabases, database]
            }));
        }
    }

    renderDatabase(database) {
        const isDisabled = this.state.type && this.state.type !== database.type;
        const isChecked = this.state.currentlySelectedDatabases.some(db => db.id === database.id);

        return (
            <label className={(isDisabled && 'database text-gray-400') || 'database text-seqblue'}>
                <input
                    type="checkbox"
                    name="databases[]"
                    value={database.id}
                    data-type={database.type}
                    disabled={isDisabled}
                    checked={isChecked}
                    className="checkbox-database"
                    onChange={_.bind(function () {
                        this.handleDatabaseSelectionClick(database);
                    }, this)}

                />
                {' ' + (database.title || database.name)}
            </label>
        );
    }

    render() {
        return (
            <div className="my-6 grid md:grid-cols-2 gap-4">
                {_.map(this.categories(), this.renderDatabases)}
            </div>
        );
    }
}
