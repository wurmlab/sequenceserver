import React from 'react';
import _ from 'underscore';
import Jstree from 'vakata/jstree';

export default React.createClass({
    getInitialState: function () {
        return { type: '' };
    },

    databases: function (category) {
        var databases = this.props.databases;
        if (category) {
            databases = _.select(databases, database => database.type === category);
        }

        return _.sortBy(databases, 'title');
    },

    nselected: function () {
        return $('input[name="databases[]"]:checked').length;
    },

    categories: function () {
        return _.uniq(_.map(this.props.databases,
            _.iteratee('type'))).sort();
    },

    handleClick: function (database) {
        var type = this.nselected() ? database.type : '';
        if (type != this.state.type) this.setState({type: type});
    },

    handleLoadTree: function (category) {
      var tree_id = '#' + category + '_database_tree';
      // hack that is needed to sync the selected tree db with the hidden main db
      window.jstree_node_change_timeout = null;

      // when a tree database gets selected
      $(tree_id).on("select_node.jstree deselect_node.jstree", function (e, data) {
        if (window.jstree_node_change_timeout) {
          clearTimeout(window.jstree_node_change_timeout);
          window.jstree_node_change_timeout = null;
        }

        window.jstree_node_change_timeout = setTimeout(function(){
          // uncheck all input
          $('div#database_list input[type="checkbox"]:checked').click()
          setTimeout(function(){
            // get all selected tree dbs. Also includes folders. Therefore, the id must have a length of 32
            // this id is used to find the corresponding element from the hidden main form
            selected = $(tree_id).jstree("get_selected").filter(selected => selected.length == 32)
            $.each(selected, function( index, value ) {
              // select hidden element to trigger original sequenceserver behavior, like blast algorithm, ...
              $('input[value="'+ value + '"]').click()
            });
          }, 100);
        }, 100);
      });

      $(tree_id).jstree({
        'core' : {
            'data': this.props.tree[category]
          },
        "plugins" : [ "checkbox", "search", "sort" ],
        "checkbox" : {
            "keep_selected_style" : false
          }
        });
    },

    handleTreeSearch: function(category, tree_id, search_id) {
      var search_for = $('#' + search_id).val();
      $('#' + tree_id).jstree(true).search(search_for);
    },

    handleToggle: function (toggleState, type) {
        switch (toggleState) {
        case '[Select all]':
            $(`.${type} .database input:not(:checked)`).click();
            break;
        case '[Deselect all]':
            $(`.${type} .database input:checked`).click();
            break;
        }
    },

    render: function () {
        return (
            <div className="form-group databases-container">
                { _.map(this.categories(), this.renderDatabases) }
            </div>
        );
    },

    renderDatabases: function (category) {
        // Panel name and column width.
        var panelTitle = category[0].toUpperCase() +
            category.substring(1).toLowerCase() + ' databases';
        var columnClass = this.categories().length === 1 ?  'col-md-12' :
            'col-md-6';

        // Toggle button.
        var toggleState = '[Select all]';
        var toggleClass = 'btn-link';
        var toggleShown = this.databases(category).length > 1 ;
        var toggleDisabled = this.state.type && this.state.type !== category;
        if (toggleShown && toggleDisabled) toggleClass += ' disabled';
        if (!toggleShown) toggleClass += ' hidden';
        if (this.nselected() === this.databases(category).length) {
            toggleState = '[Deselect all]';
        }

        // JSX.
        return (
            <div className={columnClass} key={'DB_'+category}>
                <div className="panel panel-default" id="database_list">
                    <div className="panel-heading">
                        <h4 style={{display: 'inline'}}>{panelTitle}</h4> &nbsp;&nbsp;
                        {
                          this.renderDatabaseSearch(category)
                        }
                        <button type="button" className={toggleClass} disabled={toggleDisabled} style={{display: 'none'}}
                            onClick={ function () { this.handleToggle(toggleState, category); }.bind(this) }>
                            {toggleState}
                        </button>
                    </div>
                    <ul className={'list-group databases ' + category} style={{display: 'none'}}>
                        {
                            _.map(this.databases(category), _.bind(function (database,index) {
                                return (
                                    <li className="list-group-item" key={'DB_'+category+index}>
                                        { this.renderDatabase(database) }
                                    </li>
                                );
                            }, this))
                        }
                    </ul>
                </div>
                {
                  this.renderDatabaseTree(category)
                }
            </div>
        );
    },

    renderDatabaseSearch: function (category) {
      var tree_id = category + "_database_tree";
      var search_id = tree_id + "_search";

      return (
        <input type='text' id={search_id} class="input"
        onKeyUp=
        {
            _.bind(function () {
                this.handleTreeSearch(category, tree_id, search_id)
            }, this)
        }
        ></input>
      );
    },

    renderDatabaseTree: function (category) {
      var tree_id = category + "_database_tree";
      var data = this.props.tree[category];

      return (
        <div
          id={tree_id}
          className={'jstree_div'}
          onClick=
          {
              _.bind(function () {
                  this.handleLoadTree(category)
              }, this)
          }
          >
        </div>
      );
    },

    renderDatabase: function (database) {
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
                        }/>
                {' ' + (database.title || database.name)}
            </label>
        );
    },

    componentDidUpdate: function () {
        if (this.databases() && this.databases().length === 1) {
            $('.databases').find('input').prop('checked',true);
            this.handleClick(this.databases()[0]);
        }

        if (this.props.preSelectedDbs) {
            var selectors = this.props.preSelectedDbs.map(db => `input[value=${db.id}]`);
            $(...selectors).prop('checked',true);
            this.handleClick(this.props.preSelectedDbs[0]);
            this.props.preSelectedDbs = null;
        }
        this.props.onDatabaseTypeChanged(this.state.type);
    }
});
