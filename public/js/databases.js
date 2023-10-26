import React, { Component } from 'react';
import _ from 'underscore';

export class Databases extends Component {
    constructor(props) {
        super(props);
        this.state = { type: '' };
        this.preSelectedDbs = this.props.preSelectedDbs;
        this.updateDatabaseType = this.updateDatabaseType.bind(this);
        this.getCategories = this.getCategories.bind(this);
    }

    componentDidUpdate() {
        if (this.preSelectedDbs) {
            var selectors = this.preSelectedDbs.map((db) => `input[value=${db.id}]`);
            $(selectors.join(',')).prop('checked', true);
            this.handleClick(this.preSelectedDbs[0]);
            this.preSelectedDbs = null;
        }
        this.props.onDatabaseTypeChanged(this.state.type);
    }
    
    getCategories() {
        return _.uniq(_.map(this.props.databases, _.iteratee('type'))).sort();
    }

    updateDatabaseType (type) {
        if (type != this.state.type) this.setState({ type });

    }

    render() {
        return (
            <div className="form-group databases-container">
                {_.map(this.getCategories(), (category) =>( 
                    <DatabaseCategory 
                        key={category} 
                        type={this.state.type} 
                        databases={this.props.databases} 
                        updateDatabaseType={this.updateDatabaseType} 
                        category={category}
                        getCategories={this.getCategories} 
                    />
                ))}
            </div>
        );
    }
}

export class DatabaseCategory extends Component {
    constructor(props) {
        super(props);
        this.state = { allSelected: false, selectedDbs: [] };
        this.databases = this.props.databases;
        this.category = this.props.category;
        this.getCategories = this.props.getCategories;
        this.getDatabases = this.getDatabases.bind(this);
        this.nselected = this.nselected.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
        this.renderPanelHeading = this.renderPanelHeading.bind(this);
        this.renderDatabase = this.renderDatabase.bind(this);

    }
    componentDidUpdate() {
        // SELECT DATABASE by default if only one is present
        if (this.getDatabases() && this.getDatabases().length === 1) {
            $('.databases').find('input').prop('checked', true);
            this.handleClick(this.getDatabases()[0]);
        }
    }
    getDatabases(category) {
        var databases = this.databases;
        if (category) {
            databases = _.select(databases, (database) => database.type === category);
        }

        return _.sortBy(databases, 'title');
    }

    nselected() {
        return $('input[name="databases[]"]:checked').length;
    }

    handleClick(checked, database, category) {
        const getSelectedDbs = (currentState) =>
            checked
                ? currentState.selectedDbs.concat([database.id])
                : currentState.selectedDbs.filter((db) => db !== database.id);

        this.setState(
            (prevState) => ({
                selectedDbs: getSelectedDbs(prevState),
                allSelected:
          getSelectedDbs(prevState).length === this.getDatabases(category).length,
            })
        );
        var type = this.nselected() ? database.type : '';
        this.props.updateDatabaseType(type);
    }

    handleToggle(type) {
        this.state.allSelected
            ? $(`.${type} .database input:checked`).click()
            : $(`.${type} .database input:not(:checked)`).click();
    }

    renderDatabase(database){
        var disabled = this.props.type && this.props.type !== database.type;

        return (
            <label className={(disabled && 'disabled database') || 'database'}>
                <input
                    type="checkbox"
                    name="databases[]"
                    value={database.id}
                    data-type={database.type}
                    disabled={disabled}
                    checked={this.state.selectedDbs.includes(database.id)}
                    onChange={_.bind(function (evt) {
                        this.handleClick(evt.target.checked, database, this.category);
                    }, this)}
                />
                {' ' + (database.title || database.name)}
            </label>
        );
    }

    renderPanelHeading(){
        // Panel name and column width.
        var panelTitle =
         this.category[0].toUpperCase() +
         this.category.substring(1).toLowerCase() +
         ' databases';
        // Toggle button.
        var toggleState =
         this.state.allSelected ? '[Deselect all]' : '[Select all]';
        var toggleClass = 'btn-link';
        var toggleShown = this.getDatabases(this.category).length > 1;
        var toggleDisabled = this.props.type && this.props.type !== this.category;
        if (toggleShown && toggleDisabled) toggleClass += ' disabled';
        if (!toggleShown) toggleClass += ' hidden';
        return  (
            <div className="panel-heading">
                <h4 style={{ display: 'inline' }}>{panelTitle}</h4> &nbsp;&nbsp;
                <button
                    type="button"
                    className={toggleClass}
                    disabled={toggleDisabled}
                    onClick={function () {
                        this.handleToggle(this.category);
                    }.bind(this)}
                >
                    {toggleState}
                </button>
            </div>);
    }

    render() {
        var columnClass = this.getCategories().length === 1 ? 'col-md-12' : 'col-md-6';

        // JSX.
        return (
            <div className={columnClass} key={'DB_' + this.category}>
                <div className="panel panel-default">
                    {this.renderPanelHeading()}
                    <ul className={'list-group databases ' + this.category}>
                        {_.map(
                            this.getDatabases(this.category),
                            _.bind(function (database, index) {
                                return (
                                    <li
                                        className="list-group-item"
                                        key={'DB_' + this.category + index}
                                    >
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

}