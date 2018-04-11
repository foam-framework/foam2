/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2.search',
  name: 'FilterController',
  extends: 'foam.u2.View',

  requires: [
    'foam.mlang.sink.Count',
    'foam.u2.search.BooleanRefinement',
    'foam.u2.search.EnumRefinement',
    'foam.u2.search.GroupAutocompleteSearchView',
    'foam.u2.search.GroupBySearchView',
    'foam.u2.search.PropertyRefinement',
    'foam.u2.search.SearchManager',
    'foam.u2.search.TextSearchView',
    'foam.u2.TableView',
    'foam.u2.tag.Card',
    'foam.u2.tag.Input',
    'foam.u2.view.ChoiceView',
    'foam.u2.ViewSpec'
  ],

  exports: [
    'as filterController',
    'data as unfilteredDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          display: flex;
          overflow: hidden;
          flex-grow: 1;
          width: 100%;
        }
        ^search-panel {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow: hidden;
          min-width: 250px;
        }
        ^adding {
          border: none;
          flex-shrink: 0;
          flex-grow: 0;
          padding: 8px;
        }
        ^add-filter {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ^count {
          align-items: center;
          display: flex;
          justify-content: space-between;
        }
        ^results {
          display: flex;
          flex-grow: 1;
          overflow: hidden;
        }
        ^filter-area {
          flex-grow: 1;
          overflow-y: auto;
        }
        ^filter-header {
          align-items: center;
          display: flex;
        }
        ^filter-label {
          flex-grow: 1;
        }
        ^filter-container {
          margin: 6px 8px 0px;
        }
      */}
    })
  ],

  properties: [
    'count',
    'totalCount',
    {
      name: 'countString',
      expression: function(count, totalCount) {
        return (count || '0') + ' of ' + (totalCount || '0');
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      required: true
    },
    'filteredDAO',
    {
      name: 'filterChoice',
      label: 'New Filter',
      factory: function() {
        return this.defaultFilter;
      }
    },
    {
      name: 'filters',
      adapt: function(old, nu) {
        // Convert from a list of strings to the full set of filters.
        if ( nu && nu.length && typeof nu[0] === 'string' ) {
          var out = [];
          for ( var i = 0; i < nu.length; i++ ) {
            var f = this.data.of.getAxiomByName(nu[i]);
            out.push([ f.name, f.label ]);
          }
          return out;
        }

        return nu;
      },
      factory: function() {
        var props = this.data.of.getAxiomsByClass(foam.core.Property)
            .filter(function(p) { return ! p.hidden; });
        return props.sort(function(a, b) {
          return a.LABEL.compare(a, b);
        }).map(function(p) {
          return [ p.name, p.label ];
        });
      }
    },
    {
      class: 'Boolean',
      name: 'allowDuplicateFilters',
      help: 'When this is true, you can create multiple filters for one ' +
          'property.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'allowAddingFilters',
      help: 'When this is true, the controls for adding new filters is shown ' +
          'at the top. When it is false, just the CLEAR button and count are ' +
          'present.',
      value: true
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'filterAreaSpec',
      value: 'div'
    },
    {
      class: 'Boolean',
      name: 'textSearch',
      help: 'Set this to true to enable freeform text search.',
      value: false
    },
    {
      class: 'Function',
      name: 'buildFilter',
      value: function buildFilter(args) {
        var e = this.Card.create();
        e.style({
          'margin-bottom': '0',
          overflow: 'visible'
        }).addClass(this.myClass('filter-container'))
            .start('div')
                .addClass(this.myClass('filter-header'))
                .add(args.label)
            .end()
            .startContext({ data: args.key })
                .add(args.showRemove ? this.REMOVE_FILTER : undefined)
            .endContext()
        .end();

        e.start('div')
            .addClass(this.myClass('filter-body'))
            .add(args.view)
        .end();
        return e;
      }
    },
    {
      name: 'searchMgr_',
      factory: function() {
        return this.SearchManager.create({
          dao$: this.data$,
          filteredDAO$: this.filteredDAO$
        });
      }
    },
    {
      class: 'StringArray',
      name: 'searchFields',
      documentation: 'Property names that are currently selected as filters.',
      factory: function() {
        return ( this.data && this.data.of && this.data.of.tableColumns ) || [];
      }
    },
    {
      name: 'searchViews_',
      factory: function() { return {}; }
    },
    {
      name: 'search',
      factory: function() {
        var of = this.data.of;
        if ( of.id ) of = of.id;
        return this.TextSearchView.create({
          of: of,
          richSearch: true,
          keywordSearch: true
        });
      }
    },
    {
      name: 'filtersE_'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'tableView',
      value: { class: 'foam.u2.TableView' }
    },
    {
      name: 'table'
    },
    {
      name: 'loaded_',
      value: false
    },
    [ 'oldSearchFields_', null ],
    [ 'addingSpec', undefined ]
  ],

  methods: [
    function initE() {
      // Assigning to unused variable to keep Closure happy.
      var _ = this.searchMgr_; // Force the factory to run.
      this.filteredDAO$.sub(this.onPredicateChange);
      this.onPredicateChange();

      this.addClass(this.myClass());
      this.startContext({ data: this });
      var searchPanel = this.start().addClass(this.myClass('search-panel'));
      var topPanel = searchPanel.start(this.addingSpec)
          .addClass(this.myClass('adding'));
      if ( this.allowAddingFilters ) {
        topPanel.start()
            .addClass(this.myClass('add-filter'))
            .start(this.ChoiceView, {
              data$: this.filterChoice$,
              choices: this.filters
            }).end()
            .add(this.NEW_FILTER)
        .end();
      }

      topPanel.start()
          .addClass(this.myClass('count'))
          .start('span')
              .addClass(this.myClass('count-text'))
              .add(this.countString$)
          .end()
          .start(this.CLEAR, { raised: true }).end()
      .end();
      this.filtersE_ = searchPanel.start(this.filterAreaSpec)
          .addClass(this.myClass('filter-area'));
      this.filtersE_.end();
      this.endContext();
      searchPanel.end();

      this.start().addClass(this.myClass('results'))
          .start(this.tableView, { of: this.data.of, data$: this.filteredDAO$ })
          .end()
      .end();

      var self = this;
      this.onload.sub(function() {
        if ( self.textSearch ) {
          self.filtersE_.add(self.buildFilter({
            label: 'Search',
            showRemove: false,
            view: self.search
          }));
          self.searchMgr_.add(self.search);
        }

        self.loaded_ = true;
      });

      this.data$.sub(this.updateSearchFields);
      this.loaded_$.sub(this.updateSearchFields);
      this.searchFields$.sub(this.updateSearchFields);

      this.data$proxy.on.reset.sub(this.updateCount);
      if ( this.data ) this.updateCount();
    },

    function addGroup(spec, prop, opt_map) {
      var map = opt_map || {};
      map.property = prop;
      map.size = map.size || 1;
      map.dao = this.data;

      var e = this.ViewSpec.createView(spec, map, this, this.searchMgr_);
      var view = this.searchMgr_.add(e);
      var filterView = this.buildFilter({
        key: view.name,
        label: prop.label,
        prop: prop,
        showRemove: this.allowAddingFilters,
        view: view
      });

      this.searchViews_[view.name] = filterView;
      return filterView;
    },

    function renderFilter(key) {
      this.filtersE_.add(this.searchViews_[key]);
    },

    function addFilter_(name) {
      // Look for existing filters for this property, and count the total
      // filters to ensure we can build a unique key.
      // This is how the multiple-fields-for-one-property support is achieved.
      var highestCount = 0;
      var alreadyExists = false;
      for ( var i = 0; i < this.searchFields.length; i++ ) {
        var split = this.splitName(this.searchFields[i]);
        if ( split.count > highestCount ) highestCount = split.count;
        if ( split.name === name ) alreadyExists = true;
      }

      if ( alreadyExists && ! this.allowDuplicateFilters ) return undefined;

      var key = name + (highestCount === 0 ? '' : '_' + (+highestCount + 1));
      var temp = foam.Array.clone(this.searchFields);
      temp.push(key);
      this.searchFields = temp;
      return key;
    },

    function addFilter(name) {
      var key = this.addFilter_(name);
    },

    function removeFilter(key) {
      var temp = foam.Array.clone(this.searchFields);
      for ( var i = 0; i < temp.length; i++ ) {
        if ( temp[i] === key ) {
          temp.splice(i, 1);
          break;
        }
      }
      this.searchFields = temp;
    },

    function splitName(key) {
      var match = key.match(/^(.*)_(\d+)$/);
      return match ?
          { name: match[1], count: match[2] } :
          { name: key, count: 1 };
    }
  ],

  listeners: [
    {
      name: 'onPredicateChange',
      isFramed: true,
      code: function() {
        this.filteredDAO.select(this.Count.create())
            .then(function(c) { this.count = c.value; }.bind(this));
      }
    },
    {
      name: 'updateCount',
      isFramed: true,
      code: function() {
        this.data.select(this.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
        this.onPredicateChange();
      }
    },
    {
      name: 'updateSearchFields',
      isFramed: true,
      code: function() {
        if ( ! this.loaded_ || ! this.data ) return;
        var fields = this.searchFields;
        var oldFields = this.oldSearchFields_;

        // Check for every filter that has been removed, and every filter that
        // is freshly added.
        // This function is responsible for choosing the view for each property.
        // Eg. drop-downs for Booleans and Enums, before/after for dates, etc.
        if ( oldFields ) {
          for ( var i = 0; i < oldFields.length; i++ ) {
            if ( ! fields || fields.indexOf(oldFields[i]) < 0 ) {
              this.searchMgr_.remove(oldFields[i]);
              this.searchViews_[oldFields[i]].remove();
              delete this.searchViews_[oldFields[i]];
            }
          }
        }

        if ( fields ) {
          for ( var i = 0; i < fields.length; i++ ) {
            if ( ! oldFields || oldFields.indexOf(fields[i]) < 0 ) {
              var split = this.splitName(fields[i]);
              var prop = this.data.of.getAxiomByName(split.name);
              var spec = prop.searchView;
              // TODO(braden): Bring in date support when it's ready.
              var options = {
                name: fields[i]
              };
              if ( prop.tableSeparator ) {
                options.split = prop.tableSeparator;
              }
              this.addGroup(spec, prop, options);
              this.renderFilter(fields[i]);
            }
          }
        }

        this.oldSearchFields_ = fields;
      }
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() { this.searchMgr_.clear(); }
    },
    {
      name: 'newFilter',
      code: function() {
        this.addFilter_(this.filterChoice);
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'PropertyRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      // Set this field to override the default logic for choosing a view.
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.GroupAutocompleteSearchView' }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'BooleanRefinement',
  refines: 'foam.core.Boolean',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: {
        class: 'foam.u2.search.GroupBySearchView',
        viewSpec: { class: 'foam.u2.view.ChoiceView', size: 3 }
      }
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.search',
  name: 'EnumRefinement',
  refines: 'foam.core.Enum',

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'searchView',
      value: { class: 'foam.u2.search.GroupBySearchView' }
    }
  ]
});
