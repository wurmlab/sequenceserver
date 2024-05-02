import React, { Component } from 'react';
import _ from 'underscore';

export class Databases extends Component {
    constructor(props) {
        super(props);
        this.state = { type: '' };
        this.preSelectedDbs = this.props.preSelectedDbs;
        this.databases = this.databases.bind(this);
        this.nselected = this.nselected.bind(this);
        this.categories = this.categories.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.renderDatabases = this.renderDatabases.bind(this);
        this.renderDatabase = this.renderDatabase.bind(this);
    }
    componentDidUpdate() {
        if (this.databases() && this.databases().length === 1) {
            $('.databases').find('input').prop('checked', true);
            this.handleClick(this.databases()[0]);
        }

        if (this.preSelectedDbs) {
            var selectors = this.preSelectedDbs.map((db) => `input[value=${db.id}]`);
            $(selectors.join(',')).prop('checked', true);
            this.handleClick(this.preSelectedDbs[0]);
            this.preSelectedDbs = null;
        }
        this.props.onDatabaseTypeChanged(this.state.type);
    }
    databases(category) {
        var databases = this.props.databases;
        if (category) {
            databases = _.select(databases, (database) => database.type === category);
        }

        return _.sortBy(databases, 'title');
    }

    nselected() {
        return $('input[name="databases[]"]:checked').length;
    }

    categories() {
        return _.uniq(_.map(this.props.databases, _.iteratee('type'))).sort();
    }

    handleClick(database) {
        var type = this.nselected() ? database.type : '';
        if (type != this.state.type) this.setState({ type: type });
    }

    handleToggle(toggleState, type) {
        switch (toggleState) {
        case '[Select all]':
            $(`.${type} .database input:not(:checked)`).click();
            break;
        case '[Deselect all]':
            $(`.${type} .database input:checked`).click();
            break;
        }
        this.forceUpdate();
    }
    renderDatabases(category) {
    // Panel name and column width.
        var panelTitle = category[0].toUpperCase() + category.substring(1).toLowerCase() + ' databases';
        var columnClass = this.categories().length === 1 ? 'col-span-2' : '';

        // Toggle button.
        var toggleState = '[Select all]';
        var toggleClass = 'px-2 text-sm';
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
                        <h4 style={{ display: 'inline' }} className="font-medium">
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
                                    <li key={'DB_' + category + index}>
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

    renderDatabase(database) {
        var disabled = this.state.type && this.state.type !== database.type;

        return (
            <label className={(disabled && 'database text-gray-400') || 'database text-seqblue'}>
                <input
                    type="checkbox"
                    name="databases[]"
                    value={database.id}
                    data-type={database.type}
                    disabled={disabled}
                    onChange={_.bind(function () {
                        this.handleClick(database);
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