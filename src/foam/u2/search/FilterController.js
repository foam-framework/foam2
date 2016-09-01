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
    'foam.u2.TableView',
    'foam.u2.ViewSpec',
    'foam.u2.tag.Card',
    'foam.u2.tag.Input',
    'foam.u2.tag.Select',
    //'foam.u2.search.DateFieldSearchView',
    'foam.u2.search.BooleanRefinement',
    'foam.u2.search.EnumRefinement',
    'foam.u2.search.GroupAutocompleteSearchView',
    'foam.u2.search.GroupBySearchView',
    'foam.u2.search.PropertyRefinement',
    'foam.u2.search.SearchManager',
    'foam.u2.search.TextSearchView'
  ],

  exports: [
    'as filterController'
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
      name: 'data',
      required: true,
      postSet: function(old, nu) {
        if ( old ) old.on.reset.unsub(this.updateCount);
        if ( nu ) nu.on.reset.sub(this.updateCount);
        this.updateCount();
      }
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
      class: 'Boolean',
      name: 'textSearch',
      help: 'Set this to true to enable freeform text search.',
      value: false
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
      factory: function() { return []; },
      postSet: function(old, nu) {
        // Check for every filter that has been removed, and every filter that
        // is freshly added.
        // This function is responsible for choosing the view for each property.
        // Eg. drop-downs for Booleans and Enums, before/after for dates, etc.
        if ( old ) {
          for ( var i = 0; i < old.length; i++ ) {
            if ( ! nu || nu.indexOf(old[i]) < 0 ) {
              this.searchMgr_.remove(old[i]);
              this.searchViews_[old[i]].remove();
              delete this.searchViews_[old[i]];
            }
          }
        }

        if ( nu ) {
          for ( var i = 0; i < nu.length; i++ ) {
            if ( ! old || old.indexOf(nu[i]) < 0 ) {
              var split = this.splitName(nu[i]);
              var prop = this.data.of.getAxiomByName(split.name);
              var spec = prop.searchView;
              // TODO(braden): Bring in date support when it's ready.
              var options = {
                inline: true,
                name: nu[i]
              };
              if ( prop.tableSeparator ) {
                options.split = prop.tableSeparator;
              }
              this.addGroup(spec, prop, options);
              this.renderFilter(nu[i]);
            }
          }
        }
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
      name: 'filtersE_',
      factory: function() {
        var e = this.start().cssClass(this.myCls('filters'));
        e.end();
        return e;
      }
    }
  ],

  methods: [
    function initE() {
      this.searchMgr_.predicate$.sub(this.onPredicateChange);
      this.filteredDAO$.sub(this.onPredicateChange);
      this.onPredicateChange();

      this.cssClass(this.myCls());
      this.startContext({ data: this });
      var topPanel = this.start().cssClass(this.myCls('search-panel'))
          .start().cssClass(this.myCls('adding'));
      if ( this.allowAddingFilters ) {
        topPanel.start()
            .cssClass(this.myCls('add-filter'))
            .start(this.Select, {
              inline: true,
              data$: this.filterChoice$,
              choices: this.filters
            }).end()
            .add(this.NEW_FILTER)
        .end();
      }

      topPanel.start()
          .cssClass(this.myCls('count'))
          .start('span')
              .cssClass(this.myCls('count-text'))
              .add(this.countString$)
          .end()
          .add(this.CLEAR)
      .end()
      .end()
      .start().cssClass(this.myCls('filter-area'))
          .add(this.filtersE_)
      .end()
      .end();
      this.endContext();

      var e = this.start().cssClass(this.myCls('results'));
      this.tableE(e);
      e.end();

      var self = this;
      this.onload.sub(function() {
        if ( self.textSearch ) {
          self.filtersE_.add(self.wrapCard_(self.FilterView.create({
            label: self.search.label,
            showRemove: false
          }).add(self.search)));
          self.searchMgr_.add(self.search);
        }

        // Tickle the searchFields, in case it has a factory or expression.
        // This ensures that if searchFields is pre-populated, those views get
        // rendered.
        self.searchFields;
      });
    },

    function tableE(parent) {
      parent.start(this.TableView, {
        data$: this.filteredDAO$,
        editColumnsEnabled: true,
        title$: this.title$
      }).end();
    },

    function addGroup(spec, prop, opt_map) {
      var map = opt_map || {};
      map.property = prop;
      map.size = map.size || 1;
      map.dao = this.data;

      var e = this.ViewSpec.createView(spec, map, this, this.searchMgr_);
      var view = this.searchMgr_.add(e);
      var filterView = this.FilterView.create({
        key: view.name,
        prop: prop,
        showRemove: this.allowAddingFilters
      }).add(view);

      this.searchViews_[view.name] = this.wrapCard_(filterView);
      return filterView;
    },

    function wrapCard_(view) {
      return this.Card.create({ padding: false }).style({
        'margin-bottom': '0',
        overflow: 'visible'
      }).add(view);
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
      return match ? { name: match[1], count: match[2] } :
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
          width: 250px;
        }
        ^adding {
          border: 1px solid #e0e0e0;
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
          flex-grow: 1;
          overflow: auto;
        }
      */}
    })
  ],

  classes: [
    {
      name: 'FilterView',
      extends: 'foam.u2.View',
      imports: [
        'filterController'
      ],
      properties: [
        'prop',
        'key',
        'bodyE',
        // TODO(braden): Replace this custom hack when we have "inner" views.
        [ 'overrideAdd_', true ],
        {
          name: 'label',
          expression: function(prop) { return prop.label; }
        },
        [ 'showRemove', true ],
        {
          name: 'addQueue_',
          factory: function() { return []; }
        }
      ],

      actions: [
        {
          name: 'removeFilter',
          label: 'Close',
          icon: 'close',
          code: function() {
            this.filterController.removeFilter(this.key);
          }
        }
      ],

      methods: [
        function add() {
          if ( this.overrideAdd_ ) {
            if ( this.bodyE ) {
              this.bodyE.add.apply(this.bodyE, arguments);
            } else {
              this.addQueue_.push(Array.prototype.slice.call(arguments));
            }
          } else {
            this.SUPER.apply(this, arguments);
          }
          return this;
        },
        function initE() {
          this.overrideAdd_ = false;

          this.cssClass(this.myCls()).cssClass(this.myCls('container'));
          this.start('div')
              .cssClass(this.myCls('header'))
              .start()
                  .cssClass(this.myCls('label'))
                  .add(this.label)
                  .end()
              .startContext({ data: this })
              .add(this.showRemove ? this.REMOVE_FILTER : undefined)
              .endContext()
              .end();

          this.bodyE = this.start('div').cssClass(this.myCls('body'));
          for ( var i = 0; i < this.addQueue_.length; i++ ) {
            this.bodyE.add.apply(this.bodyE, this.addQueue_[i]);
          }
          this.bodyE.end();

          this.overrideAdd_ = true;
        }
      ],

      axioms: [
        foam.u2.CSS.create({
          code: function CSS() {/*
            ^header {
              align-items: center;
              display: flex;
            }
            ^label {
              flex-grow: 1;
            }
            ^container {
              margin: 12px;
            }
            ^body input {
              width: 100%;
            }
          */}
        })
      ]
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
      value: { class: 'foam.u2.search.GroupBySearchView' }
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

