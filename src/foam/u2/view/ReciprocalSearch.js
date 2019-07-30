/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReciprocalSearch',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.search.SearchManager',
    'foam.u2.search.TextSearchView',
    'foam.u2.view.SearchViewWrapper'
  ],

  constants: [
    {
      name: 'FORMAT_REGEX',
      value: /\B(?=(\d{3})+(?!\d))/g,
      type: 'Regex',
      documentation: `
        Used to add commas to separate groups of three digits when formatting
        numbers. Eg: "12900500" becomes "12,900,500"
      `
    }
  ],

  imports: [
    'dao',
    'searchColumns'
  ],

  exports: [
    'as filterController',
    'as data',
    'searchManager'
  ],

  css: `
    ^ {
      background-color: white;
      border-radius: 2px;
      min-width: 250px;
      font-size: smaller;
    }

    ^ input {
      font-size: medium;
    }

    ^ .foam-u2-tag-Input {
      width: 100%;
    }

    ^ input:not([type="checkbox"]):focus,
    ^ select:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }

    ^ .general-query {
      padding: 16px 20px;
    }

    ^count {
      font-size: 12pt;
      color: #555;
      margin: 20px 20px 0 20px;
    }

    ^ .foam-u2-ActionView-clear {
      margin: 20px;
    }
  `,

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'data'
    },
    {
      class: 'Array',
      name: 'filters',
      factory: null,
      expression: function(dao, searchColumns) {
        var of = dao && dao.of;

        if ( ! of ) return [];

        if ( searchColumns ) return searchColumns;

        if ( of.model_.searchColumns ) return of.model_.searchColumns;

        if ( of.model_.tableColumns ) {
          return of.model_.tableColumns.filter(function(c) {
            var axiom = of.getAxiomByName(c);
            return axiom && axiom.searchView;
          });
        }

        return of.getAxiomsByClass(foam.core.Property)
            .filter((prop) => prop.searchView && ! prop.hidden)
            .map(foam.core.Property.NAME.f);
      }
    },
    {
      class: 'Int',
      name: 'selectedCount',
      postSet: function() {
        this.isLoading = false;
      }
    },
    {
      class: 'Int',
      name: 'totalCount',
      postSet: function() {
        this.isLoading = false;
      }
    },
    {
      name: 'searchManager',
      factory: function() {
        return this.SearchManager.create({
          dao$: this.dao$,
          predicate$: this.data$
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      documentation: `
        Indicates that the view hasn't gotten the count of objects in the DAO
        back yet and is therefore still loading.
      `,
      value: true
    },
    {
      class: 'String',
      name: 'countText',
      documentation: `
        The formatted text that shows how many items have been selected from the
        DAO. Shows "Loading..." while waiting for the total count to avoid
        "0 of 0 selected" being shown while loading.
      `,
      expression: function(selectedCount, totalCount, isLoading) {
        if ( isLoading ) {
          return 'Loading...';
        }
        const fmt = (num) => num.toString().replace(this.FORMAT_REGEX, ',');
        return `${fmt(selectedCount)} of ${fmt(totalCount)} selected`;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.dao.on.sub(this.updateTotalCount);
      this.updateTotalCount();

      this.
        addClass(self.myClass()).
        add(this.slot(function(filters) {
          self.show(filters.length);

          this.searchManager.filteredDAO$.sub(self.updateSelectedCount);
          self.updateSelectedCount(0, 0, 0, this.searchManager.filteredDAO$);

          var e = this.E('div');

          e.onDetach(this.searchManager);

          var slot = self.SimpleSlot.create();

          e
            .start(self.TextSearchView, {
                richSearch: true,
                of: self.dao.of.id,
                onKey: true,
                viewSpec: {
                  class: 'foam.u2.tag.Input',
                  focused: true
                }
            }, slot)
              .addClass('general-query')
            .end();

          this.searchManager.add(slot.value);

          e.forEach(filters, function(f) {
            var axiom = self.dao.of.getAxiomByName(f);

            this
              .start(self.SearchViewWrapper, {
                searchView: axiom.searchView,
                property: axiom,
                dao: self.dao
              })
                .addClass(self.myClass('filter'))
              .end();
          });

          return e;
        }, this.filters$))
        .start()
          .addClass(self.myClass('count'))
          .add(self.countText$)
        .end()
        .tag(this.CLEAR, { buttonStyle: 'SECONDARY' });
    },

    function addFilter(key) {
      this.filters = this.filters.concat(key);
    },

    function removeFilter(key) {
      this.filters = this.filters.filter(function(k) {
        return key !== k;
      });
    }
  ],

  actions: [
    {
      name: 'clear',
      code: function() {
        this.data = undefined;
        this.filters = this.filters.slice();
      }
    }
  ],

  listeners: [
    {
      name: 'updateTotalCount',
      isFramed: true,
      code: function() {
        this.dao.select(foam.mlang.sink.Count.create()).then(function(c) {
          this.totalCount = c.value;
        }.bind(this));
      }
    },
    {
      name: 'updateSelectedCount',
      isFramed: true,
      code: function(_, __, ___, dao) {
        dao.get().select(foam.mlang.sink.Count.create()).then(function(c) {
          this.selectedCount = c.value;
        }.bind(this));
      }
    }
  ]
});
