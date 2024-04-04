import React from 'react';
import _ from 'underscore';
import Jstree from 'jstree';
import { Databases } from './databases';

export default class extends Databases {
    constructor(props) {
        super(props);
        this.handleLoadTree = this.handleLoadTree.bind(this);
        this.renderDatabases = this.renderDatabases.bind(this);
        this.renderDatabaseSearch = this.renderDatabaseSearch.bind(this);
        this.renderDatabaseTree = this.renderDatabaseTree.bind(this);
    }

    handleLoadTree(category) {
        var tree_id = '#' + category + '_database_tree';
        // hack that is needed to sync the selected tree db with the hidden main db
        window.jstree_node_change_timeout = null;

        // when a tree database gets selected
        $(tree_id).on('select_node.jstree deselect_node.jstree', function (e, data) {
            if (window.jstree_node_change_timeout) {
                clearTimeout(window.jstree_node_change_timeout);
                window.jstree_node_change_timeout = null;
            }

            window.jstree_node_change_timeout = setTimeout(function () {
                // uncheck all input
                $('div#database_list input[type="checkbox"]:checked').click();
                setTimeout(function () {
                    // get all selected tree dbs. Also includes folders. Therefore, the id must have a length of 32
                    // this id is used to find the corresponding element from the hidden main form
                    var selected = $(tree_id).jstree('get_selected').filter(selected => selected.length == 32);
                    $.each(selected, function (index, value) {
                        // select hidden element to trigger original sequenceserver behavior, like blast algorithm, ...
                        $('input[value="' + value + '"]').click();
                    });
                }, 100);
            }, 100);
        });

        $(tree_id).jstree({
            'core': {
                'data': this.props.tree[category]
            },
            'plugins': ['checkbox', 'search', 'sort'],
            'checkbox': {
                'keep_selected_style': false
            }
        });
    }

    handleTreeSearch(category, tree_id, search_id) {
        var search_for = $('#' + search_id).val();
        $('#' + tree_id).jstree(true).search(search_for);
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
                <div className='panel panel-default' id='database_list'>
                    <div className='panel-heading'>
                        <h4 style={{ display: 'inline' }}>{panelTitle}</h4> &nbsp;&nbsp;
                        {
                            this.renderDatabaseSearch(category)
                        }
                        <button type='button' className={toggleClass} disabled={toggleDisabled} style={{ display: 'none' }}
                            onClick={function () { this.handleToggle(toggleState, category); }.bind(this)}>
                            {toggleState}
                        </button>
                    </div>
                    <ul className={'list-group databases ' + category} style={{ display: 'none' }}>
                        {
                            _.map(this.databases(category), _.bind(function (database, index) {
                                return (
                                    <li className='list-group-item' key={'DB_' + category + index}>
                                        {this.renderDatabase(database)}
                                    </li>
                                );
                            }, this))
                        }
                    </ul>
                </div>
                {
                    this.renderDatabaseTree(category)
                }
                <link rel="stylesheet" media="screen,print" type="text/css" href="vendor/github/vakata/jstree@3.3.8/dist/themes/default/style.min.css"/>
            </div>
        );
    }

    renderDatabaseSearch(category) {
        var tree_id = category + '_database_tree';
        var search_id = tree_id + '_search';

        return (
            <input type='text' id={search_id} className='border rounded px-1' placeholder='Search...'
                onKeyUp=
                    {
                        _.bind(function () {
                            this.handleTreeSearch(category, tree_id, search_id);
                        }, this)
                    }
            ></input>
        );
    }

    renderDatabaseTree(category) {
        const tree_id = category + '_database_tree';
        const data = this.props.tree[category];

        return (
            <div
                id={tree_id}
                className={'jstree_div'}
                onClick=
                    {
                        _.bind(function () {
                            this.handleLoadTree(category);
                        }, this)
                    }
            >
            </div>
        );
    }

}
