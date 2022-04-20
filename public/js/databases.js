import React, { Component } from 'react';
import _ from 'underscore';

export class Databases extends Component {
    constructor(props) {
        super(props);
        this.state = { type: '' };
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

        if (this.props.preSelectedDbs) {
            var selectors = this.props.preSelectedDbs.map(db => `input[value=${db.id}]`);
            $(selectors.join(',')).prop('checked', true);
            this.handleClick(this.props.preSelectedDbs[0]);
            this.props.preSelectedDbs = null;
        }
        this.props.onDatabaseTypeChanged(this.state.type);
    }
    databases(category) {
        var databases = this.props.databases;
        if (category) {
            databases = _.select(databases, database => database.type === category);
        }

        return _.sortBy(databases, 'title');
    }

    nselected() {
        return $('input[name="databases[]"]:checked').length;
    }

    categories() {
        return _.uniq(_.map(this.props.databases,
            _.iteratee('type'))).sort();
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
        var panelTitle = category[0].toUpperCase() +
            category.substring(1).toLowerCase() + ' databases';
        var columnClass = this.categories().length === 1 ? 'col-md-12' :
            'col-md-6';

        // Toggle button.
        var toggleState = '[Select all]';
        var toggleClass = 'btn-link';
        var toggleShown = this.databases(category).length > 1;
        var toggleDisabled = this.state.type && this.state.type !== category;
        if (toggleShown && toggleDisabled) toggleClass += ' disabled';
        if (!toggleShown) toggleClass += ' hidden';
        if (this.nselected() === this.databases(category).length) {
            toggleState = '[Deselect all]';
        }

        // JSX.
        return (
            <div className={columnClass} key={'DB_' + category}>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h4 style={{ display: 'inline' }}>{panelTitle}</h4> &nbsp;&nbsp;
                        <button type="button" className={toggleClass} disabled={toggleDisabled}
                            onClick={function () { this.handleToggle(toggleState, category); }.bind(this)}>
                            {toggleState}
                        </button>
                    </div>
                    <ul className={'list-group databases ' + category}>
                        {
                            _.map(this.databases(category), _.bind(function (database, index) {
                                return (
                                    <li className="list-group-item" key={'DB_' + category + index}>
                                        {this.renderDatabase(database)}
                                    </li>
                                );
                            }, this))
                        }
                    </ul>
                </div>
            </div>
        );
    }

    renderDatabase(database) {
        var disabled = this.state.type && this.state.type !== database.type;

        return (
            <label
                className={disabled && 'disabled database' || 'database'}>
                <input
                    type="checkbox" name="databases[]" value={database.id}
                    data-type={database.type} disabled={disabled}
                    onChange=
                        {
                            _.bind(function () {
                                this.handleClick(database);
                            }, this)
                        } />
                {' ' + (database.title || database.name)}
            </label>
        );
    }

    render() {
        return (
            <div className="form-group databases-container">
                {_.map(this.categories(), this.renderDatabases)}
            </div>
        );
    }
}