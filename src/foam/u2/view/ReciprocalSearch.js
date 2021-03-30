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

  imports: [
    'dao',
    'memento',
    'searchColumns',
    'translationService'
  ],

  exports: [
    'as filterController',
    'as data',
    'currentMemento_ as memento',
    'searchManager'
  ],

  css: `
    ^ {
      background-color: white;
      border-radius: 2px;
      min-width: 250px;
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

  messages: [
    { name: 'SELECTED_TEXT', message: 'selected' },
    { name: 'OF_TEXT', message: 'of' }
  ],

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

        var searchColumnsAxiom = of.getAxiomByName('searchColumns');

        if ( searchColumnsAxiom != null && Array.isArray(searchColumnsAxiom.columns) ) {
          return searchColumnsAxiom.columns;
        }

        var tableColumnsAxiom = of.getAxiomByName('tableColumns');

        if ( tableColumnsAxiom != null && Array.isArray(tableColumnsAxiom.columns) ) {
          return tableColumnsAxiom.columns.filter(function(c) {
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
      name: 'selectedCount'
    },
    {
      class: 'Int',
      name: 'totalCount'
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
      class: 'Int',
      name: 'loadingRequests',
      documentation: `
        Incremented every time an async call is made to the DAO and decremented
        every time a call finishes. A non-zero value indicates that this view is
        loading.
      `
    },
    {
      class: 'String',
      name: 'countText',
      documentation: `
        The formatted text that shows how many items have been selected from the
        DAO. Shows "Loading..." while waiting for the total count to avoid
        "0 of 0 selected" being shown while loading.
      `,
      expression: function(selectedCount, totalCount, loadingRequests) {
        var selected_ = ctrl.__subContext__.translationService.getTranslation(foam.locale, 'foam.u2.view.ReciprocalSearch.SELECTED', this.SELECTED_TEXT);
        var of_ = ctrl.__subContext__.translationService.getTranslation(foam.locale, 'foam.u2.view.ReciprocalSearch.OF', this.OF_TEXT);

        if ( loadingRequests > 0 ) {
          return 'Loading...';
        }
        return `${selectedCount.toLocaleString(foam.locale)} ` +  of_ + ` ${totalCount.toLocaleString(foam.locale)} ` + selected_;
      }
    },
    'currentMemento_'
  ],

  methods: [
    function initE() {
      var self = this;

      this.dao.on.sub(this.updateTotalCount);
      this.dao.on.sub(function() {
        self.updateSelectedCount(0, 0, 0, self.searchManager.filteredDAO$);
      });

      this.updateTotalCount();

      var m;
      if ( this.memento ) {
        m = this.memento.tail || this.memento;
        if ( ! m.tail ) {
          m.tail = foam.nanos.controller.Memento.create();
        }
        m = this.memento.tail || this.memento;
        this.currentMemento_ = this.memento.tail;
      }

      var counter = this.filters.length;

      this.
        addClass(self.myClass()).
        add(this.slot(function(filters) {
          this.searchManager.filteredDAO$.sub(self.updateSelectedCount);
          self.updateSelectedCount(0, 0, 0, this.searchManager.filteredDAO$);

          var e = this.E('div');

          e.onDetach(this.searchManager);

          var searchView = foam.u2.ViewSpec.createView(self.TextSearchView, {
            richSearch: true,
            of: self.dao.of.id,
            onKey: true,
            viewSpec: {
              class: 'foam.u2.tag.Input',
              focused: true
            }
          }, this, this.__subContext__.createSubContext({ memento: this.memento.tail }));
          var slot = self.SimpleSlot.create({ value: searchView });

          e.start()
            .tag(slot)
            .addClass('general-query')
          .end();

          if (this.memento && this.memento.tail )
            m = this.memento.tail.tail;
          else
            m = null;

          this.searchManager.add(slot.value);

          e.forEach(filters, function(f) {
            var axiom = self.dao.of.getAxiomByName(f);

            var localM = m;

            var propView = foam.u2.ViewSpec.createView(self.SearchViewWrapper, {
              searchView: axiom.searchView,
              property: axiom,
              dao: self.dao
            }, self, self.__subSubContext__.createSubContext({ memento: localM }));

            this
            .start()
                .add(propView)
                .addClass(self.myClass('filter'))
              .end();

            if ( self.memento && m ) {
              if ( ! m.tail )
                m.tail = foam.nanos.controller.Memento.create();
              counter--;
              if ( counter != 0 )
                m = m.tail;
            }
          });

          return e;
        }, this.filters$))
        .start()
          .addClass(self.myClass('count'))
          .add(self.countText$)
        .end()
        .tag(this.CLEAR, { buttonStyle: 'SECONDARY' });

        this.currentMemento_ = m;
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
        this.data    = undefined;
        this.filters = this.filters.slice();
      }
    }
  ],

  listeners: [
    {
      name: 'updateTotalCount',
      isMerged: true,
      mergeDelay: 250,
      code: function() {
        this.loadingRequests++;
        this.dao
          .select(foam.mlang.sink.Count.create())
          .then((c) => {
            this.totalCount = c.value;
          })
          .finally(() => {
            this.loadingRequests--;
          });
      }
    },
    {
      name: 'updateSelectedCount',
      isMerged: true,
      mergeDelay: 500,
      code: function(_, __, ___, sink) {
        this.loadingRequests++;
        sink
          .get()
          .select(foam.mlang.sink.Count.create())
          .then((c) => {
            this.selectedCount = c.value;
          })
          .finally(() => {
            this.loadingRequests--;
          });
      }
    }
  ]
});
